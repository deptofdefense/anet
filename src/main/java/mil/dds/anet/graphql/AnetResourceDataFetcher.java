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

import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;

import graphql.Scalars;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLArgument;
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
	
	public List<GraphQLArgument> validArguments() {
		List<GraphQLArgument> validArgs = new LinkedList<GraphQLArgument>();
		validArgs.addAll(arguments.values());
		//Only accept the f argument if we can actually do anything with it. 
		if (fetchers.size() > 0) { 
			validArgs.add(GraphQLArgument.newArgument()
				.name("f")
				.type(Scalars.GraphQLString)
				.build());
		}
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
			if (param.isAnnotationPresent(PathParam.class)) { 
				args.add(environment.getArgument(param.getAnnotation(PathParam.class).value()));
			} else if (param.isAnnotationPresent(QueryParam.class)) { 
				args.add(environment.getArgument(param.getAnnotation(QueryParam.class).value()));
			} else if (param.isAnnotationPresent(Auth.class)) { 
				args.add(((Map<String,Object>)environment.getContext()).get("auth"));
			}
			
			//TODO: DefaultValues
		}
		
		try { 
			return method.invoke(resource, args.toArray());
		} catch (Exception e) { 
			throw new WebApplicationException(e);
		}
	}

	private Method findFetcher(DataFetchingEnvironment environment) {
		if (environment.getArgument("f") != null) { 
			return fetchers.get(environment.getArgument("f"));
		}
		
		//Try to find the function that exactly matches the arguments the client provided
		Set<String> args = environment.getArguments().entrySet().stream()
			.filter(e -> (e.getValue() != null))
			.map(e -> e.getKey())
			.collect(Collectors.toSet());
		args.remove("f");
		
		if (args.size() == 0) { 
			throw new WebApplicationException("You cannot call no-argument fetchers by default. You must use the 'f' argument to specify a function name");
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
