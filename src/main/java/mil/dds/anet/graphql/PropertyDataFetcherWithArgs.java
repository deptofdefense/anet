package mil.dds.anet.graphql;

import static graphql.Scalars.GraphQLBoolean;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLNonNull;
import graphql.schema.GraphQLOutputType;
import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.utils.GraphQLUtils;

/**
 * This is the same as graphql.schema.PropertyDataFetcher except it looks for methods with arguments as well. 
 * @author hpitelka
 *
 */
public class PropertyDataFetcherWithArgs implements DataFetcher {

    private final String propertyName;
    private List<GraphQLArgument> validArgs;

    public PropertyDataFetcherWithArgs(String propertyName, Class<?> beanClazz) {
        this.propertyName = propertyName;
        findMatchingMethods(beanClazz);
    }
    
    private void findMatchingMethods(Class<?> beanClazz) { 
    	Map<String,GraphQLArgument> args = new HashMap<String,GraphQLArgument>();
    	for (Method m : beanClazz.getMethods()) { 
    		if (m.getName().equalsIgnoreCase("get" + propertyName)) { 
    			if (m.isAnnotationPresent(GraphQLIgnore.class)) { continue; }
    			for (Parameter param : m.getParameters()) {
    				if (param.isAnnotationPresent(GraphQLParam.class) == false) { 
    					throw new RuntimeException(String.format("Method %s on class %s is missing GraphQLParam annotation", m.getName(), beanClazz.getSimpleName()));
    				}
    				String argName = param.getAnnotation(GraphQLParam.class).value();
    				args.put(argName, GraphQLArgument.newArgument()
    					.name(argName)
    					.type((GraphQLInputType) GraphQLUtils.getGraphQLTypeForJavaType(param.getParameterizedType()))
    					.build());
    			}
    		}
    	}
    	validArgs = new LinkedList<GraphQLArgument>(args.values());
    }

    public List<GraphQLArgument> getValidArguments() { 
    	return validArgs;
    }
    
    @Override
    public Object get(DataFetchingEnvironment environment) {
        Object source = environment.getSource();
        if (source == null) return null;
        if (source instanceof Map) {
            return ((Map<?, ?>) source).get(propertyName);
        }
        return getPropertyViaGetter(source, environment.getFieldType(), environment);
    }

    private Object getPropertyViaGetter(Object object, GraphQLOutputType outputType, DataFetchingEnvironment environment) {
        try {
            if (isBooleanProperty(outputType)) {
                try {
                    return getPropertyViaGetterUsingPrefix(object, "is", environment);
                } catch (NoSuchMethodException e) {
                    return getPropertyViaGetterUsingPrefix(object, "get", environment);
                }
            } else {
                return getPropertyViaGetterUsingPrefix(object, "get", environment);
            }
        } catch (NoSuchMethodException e1) {
            return getPropertyViaFieldAccess(object);
        }
    }

    private Object getPropertyViaGetterUsingPrefix(Object object, String prefix, DataFetchingEnvironment environment) throws NoSuchMethodException {
        String getterName = prefix + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1);
        try {
        	List<Method> methodMatches = new LinkedList<Method>();
        	for (Method m : object.getClass().getMethods()) { 
        		if (m.getName().equals(getterName)) { 
        			Object[] args = fetchParameters(m, environment);
        			if (args != null) { 
        				return m.invoke(object, args);
        			}
        			methodMatches.add(m);
        		}
        	}
        	if (methodMatches.size() > 0) { 
        		String methodMatchArgString = paramsToString(methodMatches);
        		throw new RuntimeException("Missing arguments for " + getterName + ", matches: " + methodMatchArgString);
        	} else { 
        		throw new NoSuchMethodException();
        	}

        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e);
        }
    }
    
    private Object[] fetchParameters(Method m, DataFetchingEnvironment env) {
    	Parameter[] params = m.getParameters();
    	Object[] args = new Object[params.length];
    	for (int i=0;i<args.length;i++) {
    		String argName = params[i].getName();
    		if (params[i].isAnnotationPresent(GraphQLParam.class)) { 
    			argName = params[i].getAnnotation(GraphQLParam.class).value();
    		}
    		Object arg =env.getArgument(argName);
    		if (arg == null) { return null; } 
    		args[i] = arg;
    	}
    	return args;
    }
    
    private String paramsToString(List<Method> methods) { 
    	List<String> paramStrings = new LinkedList<String>();
    	for (Method m : methods) { 
    		StringBuilder sb = new StringBuilder(m.getName());
    		sb.append("(");
    		sb.append(Joiner.on(",").join(Arrays.stream(m.getParameters())
    			.map(p -> p.getAnnotation(GraphQLParam.class).value())
    			.collect(Collectors.toList())));
    		sb.append(")");
    		paramStrings.add(sb.toString());
    	}
    	return Joiner.on(", ").join(paramStrings);
    }
    
    private boolean isBooleanProperty(GraphQLOutputType outputType) {
        if (outputType == GraphQLBoolean) return true;
        if (outputType instanceof GraphQLNonNull) {
            return ((GraphQLNonNull) outputType).getWrappedType() == GraphQLBoolean;
        }
        return false;
    }

    private Object getPropertyViaFieldAccess(Object object) {
        try {
            Field field = object.getClass().getField(propertyName);
            return field.get(object);
        } catch (NoSuchFieldException e) {
            return null;
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }
}