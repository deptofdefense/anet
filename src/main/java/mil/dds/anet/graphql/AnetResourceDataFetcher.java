package mil.dds.anet.graphql;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;

import com.google.common.collect.ImmutableList;

import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLInputType;
import mil.dds.anet.utils.GraphQLUtils;

/*
 * Looks on a Resource class for methods annotated with @GraphQLFetcher and arguments with @GraphQLArg
 * to serve as data fetchers for the top level objects in queries. 
 */
public class AnetResourceDataFetcher implements DataFetcher {

	//given a set of arguments which method to call. 
	Map<Set<String>,Method> fetchers;
	Map<String, GraphQLArgument> arguments;
	IGraphQLResource resource;
	
	public AnetResourceDataFetcher(IGraphQLResource resource) {
		this.resource = resource;
		fetchers = new HashMap<Set<String>, Method>();
		arguments = new HashMap<String,GraphQLArgument>();
		
		//Find all methods that are annotated as Fetchers
		for (Method m : resource.getClass().getMethods()) { 
			if (m.isAnnotationPresent(GraphQLFetcher.class)) {
				Set<String> argNames =  new HashSet<String>();
				//Get all of their annotated arguments and record them as potential GraphQLArguments
				for (Parameter param : m.getParameters()) {
					String argName = null;
					if (param.isAnnotationPresent(PathParam.class)) { 
						argName = param.getAnnotation(PathParam.class).value();
					} else if (param.isAnnotationPresent(QueryParam.class)) { 
						argName = param.getAnnotation(QueryParam.class).value();
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
				fetchers.put(argNames,  m);
			}
		}
	}
	
	public List<GraphQLArgument> validArguments() { 
		return ImmutableList.copyOf(arguments.values());
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
			}
			
			//TODO: Auth
			//TODO: DefaultValues
		}
		
		try { 
			return method.invoke(resource, args.toArray());
		} catch (Exception e) { 
			throw new WebApplicationException(e);
		}
	}

	private Method findFetcher(DataFetchingEnvironment environment) { 
		outerLoop: //Label the outer loop so we can jump out of it.
		for (Map.Entry<Set<String>, Method> fetcher : fetchers.entrySet()) {
			for (String argName : fetcher.getKey()) { 
				if (environment.containsArgument(argName) == false) { 
					continue outerLoop;
				}
			}
			return fetcher.getValue(); 
		}
		return null;
	}
	
	
}
