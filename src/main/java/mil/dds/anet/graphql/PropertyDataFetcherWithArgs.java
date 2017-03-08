package mil.dds.anet.graphql;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.ws.rs.DefaultValue;
import javax.ws.rs.WebApplicationException;

import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLInputType;
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
	private List<Method> matchingMethods;

	public PropertyDataFetcherWithArgs(String propertyName, Class<?> beanClazz) {
		this.propertyName = propertyName;
		findMatchingMethods(beanClazz);
	}

	private void findMatchingMethods(Class<?> beanClazz) {
		Map<String,GraphQLArgument> args = new HashMap<String,GraphQLArgument>();
		matchingMethods = new LinkedList<Method>();
		for (Method m : beanClazz.getMethods()) {
			if (m.isAnnotationPresent(GraphQLIgnore.class)) { continue; }
			if (m.getName().equalsIgnoreCase("get" + propertyName)) {
				matchingMethods.add(m);
			} else if (m.getName().equalsIgnoreCase("is" + propertyName)) {
				matchingMethods.add(m);
			} else if (m.isAnnotationPresent(GraphQLFetcher.class) && m.getAnnotation(GraphQLFetcher.class).value().equals(propertyName)) {
				matchingMethods.add(m);
			}

		}

		for (Method m : matchingMethods) {
			for (Parameter param : m.getParameters()) {
				if (param.isAnnotationPresent(GraphQLParam.class) == false) {
					throw new RuntimeException(String.format("Method %s on class %s is missing GraphQLParam annotation",
							m.getName(), beanClazz.getSimpleName()));
				}
				String argName = param.getAnnotation(GraphQLParam.class).value();
				args.put(argName, GraphQLArgument.newArgument()
					.name(argName)
					.type((GraphQLInputType) GraphQLUtils.getGraphQLTypeForJavaType(param.getParameterizedType()))
					.build());
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
		if (source == null) { return null; }
		if (source instanceof Map) {
			return ((Map<?, ?>) source).get(propertyName);
		}

		Method method = GraphQLUtils.findMethod(environment,matchingMethods);
		if (method == null) {
			throw new WebApplicationException("No method found for args. Possible Methods are: " + paramsToString(matchingMethods));
		}

		Object[] args = fetchParameters(method, environment);
		try {
			return method.invoke(source, args);
		} catch (InvocationTargetException e) { 
			if (e.getCause() instanceof WebApplicationException) { 
				throw (WebApplicationException) e.getCause();
			} else { 
				throw new WebApplicationException(e.getCause());
			}
		} catch (Exception e) {
			throw new WebApplicationException(e.getMessage(),e);
		}
	}

	private Object[] fetchParameters(Method m, DataFetchingEnvironment env) {
		Parameter[] params = m.getParameters();
		Object[] args = new Object[params.length];
		for (int i = 0;i < args.length;i++) {
			String argName = params[i].getName();
			Object arg = null;
			if (params[i].isAnnotationPresent(GraphQLParam.class)) {
				argName = params[i].getAnnotation(GraphQLParam.class).value();
				arg = env.getArgument(argName);
			} else if (params[i].isAnnotationPresent(DefaultValue.class)) {
				arg = params[i].getAnnotation(DefaultValue.class).value();
			}
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
}
