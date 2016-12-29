package mil.dds.anet.utils;

import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;

import com.fasterxml.jackson.databind.ObjectMapper;

import graphql.Scalars;
import graphql.schema.GraphQLEnumType;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLInputObjectField;
import graphql.schema.GraphQLInputObjectType;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLType;
import graphql.schema.GraphQLTypeReference;
import mil.dds.anet.beans.search.ISearchQuery;
import mil.dds.anet.graphql.GraphQLDateTimeType;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.graphql.PropertyDataFetcherWithArgs;
import mil.dds.anet.views.AbstractAnetBean;

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
		} else if (Boolean.class.equals(clazz)) { 
			gType = Scalars.GraphQLBoolean;
		} else if (Double.class.equals(clazz)) { 
			gType = Scalars.GraphQLFloat;
		} else if (clazz != null && clazz.isEnum()) {
			@SuppressWarnings("unchecked")
			Class<? extends Enum<?>> enumType = (Class<? extends Enum<?>>) type;
			gType = gEnumBuilder(enumType);
		} else if (clazz != null && AbstractAnetBean.class.isAssignableFrom(clazz)) { 
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

}
