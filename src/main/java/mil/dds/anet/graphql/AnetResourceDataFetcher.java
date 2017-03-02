package mil.dds.anet.graphql;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;

import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLEnumType;
import graphql.schema.GraphQLInputType;
import io.dropwizard.auth.Auth;
import mil.dds.anet.auth.AnetAuthenticationFilter;
import mil.dds.anet.beans.Person;
import mil.dds.anet.utils.GraphQLUtils;

/*
 * Looks on a Resource class for methods annotated with @GraphQLFetcher and arguments with @GraphQLArg
 * to serve as data fetchers for the top level objects in queries. 
 */
public class AnetResourceDataFetcher implements DataFetcher {

	//given a set of arguments which method to call. 
	Map<String,Method> fetchers;
	Map<String, GraphQLArgument> arguments;
	List<Method> validMethods;
	IGraphQLResource resource;
	List<GraphQLArgument> validArgs;
	
	public static ObjectMapper mapper = new ObjectMapper();
	
	public AnetResourceDataFetcher(IGraphQLResource resource) { 
		this(resource, false);
	}
	
	public AnetResourceDataFetcher(IGraphQLResource resource, boolean isListFetcher) {
		this.resource = resource;
		fetchers = new HashMap<String,Method>();
		validMethods = new LinkedList<Method>();
		arguments = new HashMap<String,GraphQLArgument>();
		mapper.registerModule(new JodaModule());
		
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
					String argName = GraphQLUtils.getParamName(param);
					if (param.isAnnotationPresent(Auth.class)) { 
						continue;
					}
					
					if (argName != null) { 
						argNames.add(argName);
						
						Type t = param.getType();
						GraphQLArgument gqlArg = GraphQLArgument.newArgument()
							.name(argName)
							.type((GraphQLInputType) GraphQLUtils.getGraphQLTypeForJavaType(t))
							.build();
						arguments.put(argName, gqlArg);
					} else { 
						System.err.println("Unbound arg " + param.toString() + " on method" + m.getName());
					}
				}
				validMethods.add(m);
			}
		}
		
		buildValidArgs(isListFetcher);
	}
	
	/* 
	 * Determines if this method returns the right type for this Resource Fetcher
	 * must return either the right Bean (based on Resource.getBeanClass()
	 * or a list of that bean. 
	 */
	private boolean shouldUseMethod(Method m, boolean isListFetcher) { 
		if (m.getReturnType().equals(resource.getBeanClass())) { 
			return !isListFetcher; //Only use this if this is NOT a list fetcher 
		} else if (m.getReturnType().equals(resource.getBeanListClass())) { 
			return isListFetcher; //Only use this if this IS a list fetcher.	
		}
		
		throw new UnsupportedOperationException(
			String.format("Unable to use method %s as GraphQLFetcher on resource %s because it does not return a %s or %s",
				m.getName(), resource.getClass().getSimpleName(), 
				resource.getBeanClass().getSimpleName(), 
				resource.getBeanListClass().getSimpleName()));
	}
	
	private void buildValidArgs(boolean isListFetcher) { 
		validArgs = new LinkedList<GraphQLArgument>();
		validArgs.addAll(arguments.values());
		//Only accept the f argument if we can actually do anything with it. 
		if (fetchers.size() > 0) {
			String enumName = resource.getBeanClass().getSimpleName() + (isListFetcher ? "s" : "") + "_functions";
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
		
		//Check authorization
		if (method.isAnnotationPresent(RolesAllowed.class)) { 
			Person user = (Person) ((Map<String,Object>)environment.getContext()).get("auth");
			if (!isAuthorized(method, user)) { 
				throw new WebApplicationException("Forbidden", Status.FORBIDDEN);
			}
		}
		
		List<Object> args = fetchParameters(method, environment);
		try { 
			return method.invoke(resource, args.toArray());
		} catch (InvocationTargetException e) { 
			if (e.getCause() instanceof WebApplicationException) { 
				throw (WebApplicationException) e.getCause();
			} else { 
				throw new WebApplicationException(e.getCause());
			}
		} catch (Exception e) { 
			if (e.getCause() != null) { 
				throw new WebApplicationException(e.getCause().getMessage(), e);
			} else {
				throw new WebApplicationException(e.getMessage());
			}
		}
	}

	private boolean isAuthorized(Method method, Person user) {
		String[] roles = method.getAnnotation(RolesAllowed.class).value();
		for (String role : roles) { 
			if (AnetAuthenticationFilter.checkAuthorization(user, role)) { 
				return true;
			}
		}
		return false;
	}

	private List<Object> fetchParameters(Method method, DataFetchingEnvironment environment) { 
		List<Object> args = new LinkedList<Object>();
		for (Parameter param : method.getParameters()) {
			String argName = GraphQLUtils.getParamName(param);
			
			Object arg = environment.getArgument(argName);
			
			//Handle missing arguments but @DefaultValue annotations.
			if (arg == null) { 
				if (param.isAnnotationPresent(DefaultValue.class)) { 
					arg = param.getAnnotation(DefaultValue.class).value();
				} else if (param.isAnnotationPresent(Auth.class)) { 
					arg = ((Map<String,Object>)environment.getContext()).get("auth");
				} else { 
					throw new WebApplicationException("Missing argument for function " + method.getName() + ", arg: " + argName);
				}
			}
			
			//Verify the types are correct. (ignore primitives) 
			if ((!param.getType().isPrimitive()) && param.getType().isAssignableFrom(arg.getClass()) == false) {
				//If the argument passed was a Map, but we need a bean, try to convert it? 
				if (Map.class.isAssignableFrom(arg.getClass())) {
					try { 
						arg = mapper.convertValue(arg, param.getType());
					} catch (IllegalArgumentException e) {
						throw new WebApplicationException("Unable to convert Map into " + param.getType() + ": " + e.getMessage(), e);
					}
				} else {
					System.out.println("c: Arg is " + arg.getClass() + " and param is " + param.getType());
					throw new WebApplicationException(String.format("Type mismatch on arg, wanted %s got %s on %s", 
							param.getType(), arg.getClass(), method.getName()));
				}
			}
			args.add(arg);
		}
		return args;
	}
	
	

	private Method findFetcher(DataFetchingEnvironment environment) {
		if (environment.getArgument("f") != null) {
			String functionName = environment.getArgument("f");
			Method fetcher = fetchers.get(functionName);
			if (fetcher == null) { 
				throw new WebApplicationException("No such fetcher for name " + functionName);
			}
			return fetcher;
		} else { 
			Method m = GraphQLUtils.findMethod(environment, validMethods);
			return m;
		}
	}
	
	
}
