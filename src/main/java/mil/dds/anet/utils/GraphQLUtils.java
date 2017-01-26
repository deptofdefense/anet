package mil.dds.anet.utils;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.LinkedList;
import java.util.List;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;

import org.joda.time.DateTime;

import graphql.Scalars;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLEnumType;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLInputObjectField;
import graphql.schema.GraphQLInputObjectType;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLType;
import graphql.schema.GraphQLTypeReference;
import io.dropwizard.auth.Auth;
import mil.dds.anet.beans.search.ISearchQuery;
import mil.dds.anet.graphql.GraphQLDateTimeType;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLBean;
import mil.dds.anet.graphql.PropertyDataFetcherWithArgs;

public class GraphQLUtils {

	public static GraphQLFieldDefinition buildField(String name, Type type) {		
		return buildField(name, GraphQLUtils.getGraphQLTypeForJavaType(type));		
	}

	public static GraphQLFieldDefinition buildField(String name, GraphQLType type) { 
		return GraphQLFieldDefinition.newFieldDefinition()
			.type((GraphQLOutputType) type)
			.name(name)
			.build();
	}
	
	public static GraphQLFieldDefinition buildFieldWithArgs(String name, Type type, Class<?> beanClazz) {		
		return buildFieldWithArgs(name, GraphQLUtils.getGraphQLTypeForJavaType(type), beanClazz);		
	}
	
	public static GraphQLFieldDefinition buildFieldWithArgs(String fieldName, GraphQLType type, Class<?> beanClazz) {
		PropertyDataFetcherWithArgs dataFetcher = new PropertyDataFetcherWithArgs(fieldName, beanClazz);
		return GraphQLFieldDefinition.newFieldDefinition()
			.type((GraphQLOutputType) type)
			.name(fieldName)
			.dataFetcher(dataFetcher)
			.argument(dataFetcher.getValidArguments())
			.build();
	}
	
	public static GraphQLType getGraphQLTypeForJavaType(Type type) { 
		GraphQLType gType;
		Class<?> clazz = null;
		if (type instanceof Class) { 
			clazz = ((Class<?>)type);
		} else if (type instanceof ParameterizedType) { 
			clazz = (Class<?>) (((ParameterizedType)type).getRawType());
		}
		if (String.class.equals(clazz)) { 
			gType = Scalars.GraphQLString;
		}else if (Integer.class.equals(clazz) || "int".equals(type.getTypeName())) { 
			gType = Scalars.GraphQLInt;
		} else if (Boolean.class.equals(clazz) || "boolean".equals(type.getTypeName())) { 
			gType = Scalars.GraphQLBoolean;
		} else if (Double.class.equals(clazz)) { 
			gType = Scalars.GraphQLFloat;
		} else if (clazz != null && clazz.isEnum()) {
			@SuppressWarnings("unchecked")
			Class<? extends Enum<?>> enumType = (Class<? extends Enum<?>>) type;
			gType = gEnumBuilder(enumType);
		} else if (clazz != null && IGraphQLBean.class.isAssignableFrom(clazz)) { 
			gType = new GraphQLTypeReference(lowerCaseFirstLetter(clazz.getSimpleName()));
		} else if (clazz != null && List.class.isAssignableFrom(clazz)) {
			Type innerType = ((ParameterizedType)type).getActualTypeArguments()[0];
			gType = new GraphQLList(getGraphQLTypeForJavaType(innerType));
		} else if (DateTime.class.equals(clazz)) {
			gType = new GraphQLDateTimeType();
		} else if (clazz != null && ISearchQuery.class.isAssignableFrom(clazz)) {
			gType = getGraphQLTypeForSearch(clazz);
		} else {
			throw new RuntimeException("Type: " + type + " is not supported in GraphQL!");
		}
		return gType;
	}
	
	public static GraphQLEnumType gEnumBuilder(Class<? extends Enum<?>> enumClazz) { 
		Enum<?>[] constants = enumClazz.getEnumConstants();
		GraphQLEnumType.Builder builder = GraphQLEnumType.newEnum().name(enumClazz.getSimpleName());
		for (Enum<?> s : constants) { 
			builder.value(s.name(), s);
		}
		return builder.build();
	}
	
	public static String lowerCaseFirstLetter(String str) { 
		if (str.length() < 1) { 
			System.out.println("wtf bbq");
		}
		return str.substring(0, 1).toLowerCase() + str.substring(1);
	}
	
	public static GraphQLInputObjectType getGraphQLTypeForSearch(Class<?> clazz) { 
		List<GraphQLInputObjectField> fields = new LinkedList<GraphQLInputObjectField>();
		for (Method m : clazz.getMethods()) { 
			if (m.getName().startsWith("get")) { 
				if (m.isAnnotationPresent(GraphQLIgnore.class)) { continue; } 
				if (m.getName().equalsIgnoreCase("getClass")) { continue; } 
				String name = lowerCaseFirstLetter(m.getName().substring(3));
				fields.add(GraphQLInputObjectField.newInputObjectField()
					.name(name)
					.type((GraphQLInputType) getGraphQLTypeForJavaType(m.getGenericReturnType()))
					.build());
			}
		}
		
		return new GraphQLInputObjectType(clazz.getSimpleName(), "", fields);
	}

	/*
	 * Used to pick the best method out of a list given the arguments we were passed via GraphQL
	 */
	public static Method findMethod(DataFetchingEnvironment environment, List<Method> methods) { 
    	Method bestMethod = null;
    	int maxScore = -1;
    	for (Method m : methods) {
    		int score = getMethodScore(m, environment);
    		if (score > maxScore) { 
    			maxScore = score;
    			bestMethod = m;
    		}
    	}
    	return bestMethod;
    }
    
    /* Returns a 'score' for the method that is either
     * - -1 if this method cannot be used because we are missing required arguments
     * - the number of arguments if we have all of the required args. 
     */
    private static int getMethodScore(Method m, DataFetchingEnvironment environment) { 
    	int score = 0;
    	for (Parameter p : m.getParameters()) { 
    		String paramName = getParamName(p);
    		if (paramName != null && environment.getArgument(paramName) != null) { 
				score++;
    		} else if (p.isAnnotationPresent(Auth.class)) { 
    			//no biggie. 
			} else if (!p.isAnnotationPresent(DefaultValue.class)) { 
				//We're missing args, 
				return -1;
			}
    	}
    	return score;
    }
    
    public static String getParamName(Parameter param) {
		if (param.isAnnotationPresent(PathParam.class)) {
			return param.getAnnotation(PathParam.class).value();
		} else if (param.isAnnotationPresent(QueryParam.class)) { 
			return param.getAnnotation(QueryParam.class).value();
		} else if (param.isAnnotationPresent(GraphQLParam.class)) { 
			return param.getAnnotation(GraphQLParam.class).value();
		}
		return null;
	}
	
}
