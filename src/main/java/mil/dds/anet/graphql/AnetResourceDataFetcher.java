package mil.dds.anet.graphql;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;

import com.fasterxml.jackson.databind.ObjectMapper;

import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLEnumType;
import graphql.schema.GraphQLInputType;
import io.dropwizard.auth.Auth;
import mil.dds.anet.utils.GraphQLUtils;

/*
 * Looks on a Resource class for methods annotated with @GraphQLFetcher and arguments with @GraphQLArg
 * to serve as data fetchers for the top level objects in queries. 
 */
public class AnetResourceDataFetcher implements DataFetcher {

	//given a set of arguments which method to call. 
	Map<String,Method> fetchers;
	Map<Set<String>,String> fetchersByArguments;
	Map<String, GraphQLArgument> arguments;
	IGraphQLResource resource;
	List<GraphQLArgument> validArgs;
	
	public static ObjectMapper mapper = new ObjectMapper();
	
	public AnetResourceDataFetcher(IGraphQLResource resource) { 
		this(resource, false);
	}
	
	public AnetResourceDataFetcher(IGraphQLResource resource, boolean isListFetcher) {
		this.resource = resource;
		fetchersByArguments = new HashMap<Set<String>, String>();
		fetchers = new HashMap<String,Method>();
		arguments = new HashMap<String,GraphQLArgument>();
		
		//Find all methods that are annotated as Fetchers
		for (Method m : resource.getClass().getMethods()) { 
			if (m.isAnnotationPresent(GraphQLFetcher.class)) {
				if (shouldUseMethod(m, isListFetcher) == false) { continue; }
				
				GraphQLFetcher annotation = m.getAnnotation(GraphQLFetcher.class);
				String functionName = annotation.value();
				if (functionName.trim().length() == 0) { 
					functionName = m.getName();
				}
				fetchers.put(functionName, m);
				
				Set<String> argNames =  new HashSet<String>();
				//Get all of their annotated arguments and record them as potential GraphQLArguments
				for (Parameter param : m.getParameters()) {
					String argName = null;
					if (param.isAnnotationPresent(PathParam.class)) { 
						argName = param.getAnnotation(PathParam.class).value();
					} else if (param.isAnnotationPresent(QueryParam.class)) { 
						argName = param.getAnnotation(QueryParam.class).value();
					} else if (param.isAnnotationPresent(GraphQLParam.class)) { 
						argName = param.getAnnotation(GraphQLParam.class).value();
					} else if (param.isAnnotationPresent(Auth.class)) { 
						continue;
					}
					
					if (argName != null) { 
						argNames.add(argName);
						
						Type t = param.getType();
						GraphQLArgument gArg = GraphQLArgument.newArgument()
							.name(argName)
							.type((GraphQLInputType) GraphQLUtils.getGraphQLTypeForJavaType(t))
							.build();
						arguments.put(argName, gArg);
					} else { 
						System.err.println("Unbound arg " + param.toString() + " on method" + m.getName());
					}
				}
				fetchersByArguments.put(argNames,  functionName);
			}
		}
		
		buildValidArgs(isListFetcher);
	}
	
	private boolean shouldUseMethod(Method m, boolean isListFetcher) { 
		if (m.getReturnType().equals(resource.getBeanClass())) { 
			return !isListFetcher; //Only use this if this is NOT a list fetcher 
		} else if (List.class.isAssignableFrom(m.getReturnType())) { 
			ParameterizedType pType = (ParameterizedType) m.getGenericReturnType();
			Type type = pType.getActualTypeArguments()[0];
			//This needs to be a List of the Bean class
			if (type.equals(resource.getBeanClass())) { 
				return isListFetcher; //Only use this if this IS a list fetcher.	
			}
		}
		
		throw new UnsupportedOperationException(
			String.format("Unable to use method %s as GraphQLFetcher on resource %s because it does not return a %s or a List of those",
				m.getName(), resource.getClass().getSimpleName(), resource.getBeanClass().getSimpleName()));
	}
	
	private void buildValidArgs(boolean isListFetcher) { 
		validArgs = new LinkedList<GraphQLArgument>();
		validArgs.addAll(arguments.values());
		//Only accept the f argument if we can actually do anything with it. 
		if (fetchers.size() > 0) {
			String enumName = resource.getBeanClass().getSimpleName() + (isListFetcher ? "s" :"") + "_functions";
			GraphQLEnumType.Builder functionNamesEnum = GraphQLEnumType.newEnum()
				.name(enumName);
			for (String functionName : fetchers.keySet()) { 
				functionNamesEnum.value(functionName);
			}
			validArgs.add(GraphQLArgument.newArgument()
				.name("f")
				.type(functionNamesEnum.build())
				.build());
		}
	}
	
	public List<GraphQLArgument> validArguments() {
		return validArgs;
	}
	
	@Override
	public Object get(DataFetchingEnvironment environment) {
		//find a fetcher for this request
		Method method = findFetcher(environment);
		if (method == null) {
			throw new WebApplicationException("No fetcher method exists for the supplied arguments");
		}
		
		List<Object> args = new LinkedList<Object>();
		for (Parameter param : method.getParameters()) {
			Object arg = null;
			if (param.isAnnotationPresent(PathParam.class)) {
				arg = environment.getArgument(param.getAnnotation(PathParam.class).value());
			} else if (param.isAnnotationPresent(QueryParam.class)) { 
				arg = environment.getArgument(param.getAnnotation(QueryParam.class).value());
			} else if (param.isAnnotationPresent(GraphQLParam.class)) { 
				arg = environment.getArgument(param.getAnnotation(GraphQLParam.class).value());
			} else if (param.isAnnotationPresent(Auth.class)) { 
				arg = ((Map<String,Object>)environment.getContext()).get("auth");
			}
		
			//Handle missing arguments but @DefaultValue annotations.
			if (arg == null && param.isAnnotationPresent(DefaultValue.class)) { 
				arg = param.getAnnotation(DefaultValue.class).value();
			}
			System.out.println("a: Arg is " + arg.getClass() + " and param is " + param.getType());
			//Verify the types are correct. 
			if (param.getType().isAssignableFrom(arg.getClass()) == false) {
				//If the argument passed was a Map, but we need a bean, try to convert it? 
				System.out.println("b: Arg is " + arg.getClass() + " and param is " + param.getType());
				if (Map.class.isAssignableFrom(arg.getClass())) { 
					try { 
						arg = mapper.convertValue(arg, param.getType());
					} catch (IllegalArgumentException e) { 
						throw new WebApplicationException("Unable to convert Map into " + param.getType() + ": " + e.getMessage(), e);
					}
				} else {
					System.out.println("c: Arg is " + arg.getClass() + " and param is " + param.getType());
					//Otherwise just throw an exception that we got the wrong arg type. 
					throw new WebApplicationException("Type mismatch on arg, wanted " + param.getType() + " got " + arg.getClass());
				}
			}
			args.add(arg);
			
		}
		
		try { 
			return method.invoke(resource, args.toArray());
		} catch (Exception e) { 
			if (e.getCause() != null) { 
				throw new WebApplicationException(e.getCause().getMessage());
			} else {
				throw new WebApplicationException(e.getMessage());
			}
		}
	}

	private Method findFetcher(DataFetchingEnvironment environment) {
		if (environment.getArgument("f") != null) {
			String functionName = environment.getArgument("f");
			Method fetcher = fetchers.get(functionName);
			if (fetcher == null) { 
				throw new WebApplicationException("No such fetcher for name " + functionName);
			}

			for (Parameter param : fetcher.getParameters()) { 
				String argName = null;
				if (param.isAnnotationPresent(PathParam.class)) { 
					argName = param.getAnnotation(PathParam.class).value();
				} else if (param.isAnnotationPresent(QueryParam.class)) { 
					argName = param.getAnnotation(QueryParam.class).value();
				} else if (param.isAnnotationPresent(GraphQLParam.class)) { 
					argName = param.getAnnotation(GraphQLParam.class).value();
				} else {  
					continue;
				}
				if (environment.getArgument(argName) == null) { 
					throw new WebApplicationException("Missing argument for function " + functionName + ", arg: " + argName);
				}
			}
			return fetcher;
		}
		
		//Try to find the function that exactly matches the arguments the client provided
		Set<String> args = environment.getArguments().entrySet().stream()
			.filter(e -> (e.getValue() != null))
			.map(e -> e.getKey())
			.collect(Collectors.toSet());
		args.remove("f");
		
		if (args.size() == 0) { 
			throw new WebApplicationException("You must use the 'f' argument to specify a function name");
		}
		
		//Track which functions match the arguments we have. 
		List<String> matches = new LinkedList<String>();
		
		for (Map.Entry<Set<String>, String> entry : fetchersByArguments.entrySet()) {
			if (args.equals(entry.getKey())) { 
				matches.add(entry.getValue());
			}
		}
		if (matches.size() == 0) { 
			return null;
		} else if (matches.size() > 1) { 
			throw new WebApplicationException(
				String.format("Ambigous fetcher called for arguments %s.  Matches are %s.  Use the 'f' argument to specify a function name", args, matches));
		} else { 
			return fetchers.get(matches.get(0));
		}
	}
	
	
}
