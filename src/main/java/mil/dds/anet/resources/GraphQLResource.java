package mil.dds.anet.resources;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLSchema;
import io.dropwizard.auth.Auth;
import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.PersonPositionHistory;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.graphql.AnetResourceDataFetcher;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.graphql.IGraphQLBean;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.GraphQLUtils;

@Path("/graphql")
@Produces(MediaType.APPLICATION_JSON)
public class GraphQLResource {

	private static Logger log = Log.getLogger(GraphQLResource.class);
	private GraphQL graphql;
	private List<IGraphQLResource> resources;
	private boolean developmentMode;

	public GraphQLResource(List<IGraphQLResource> resources, boolean developmentMode) {
		this.resources = resources;
		this.developmentMode = developmentMode;

		buildGraph();
	}


	private void buildGraph() {
		GraphQLObjectType.Builder queryTypeBuilder = GraphQLObjectType.newObject()
			.name("query")
			.description("The root level query type for ANET");

		//Go through all of the resources to build object types for each.
		for (IGraphQLResource resource : resources) {
			Class<? extends IGraphQLBean> beanClazz = resource.getBeanClass();
			String name = GraphQLUtils.lowerCaseFirstLetter(beanClazz.getSimpleName());
			GraphQLObjectType objectType = buildTypeFromBean(name, beanClazz);

			//Build a Fetcher that uses this resource to 'find' objects of this type.
			AnetResourceDataFetcher fetcher = new AnetResourceDataFetcher(resource);

			GraphQLFieldDefinition.Builder fieldBuilder = GraphQLFieldDefinition.newFieldDefinition()
				.type(objectType)
				.name(name)
				.description(resource.getDescription())
				.argument(fetcher.validArguments())
				.dataFetcher(fetcher);
			queryTypeBuilder.field(fieldBuilder.build());


			AnetResourceDataFetcher listFetcher = new AnetResourceDataFetcher(resource, true);
			if (listFetcher.validArguments().size() > 0) {
				Class<?> listClass = resource.getBeanListClass();
				GraphQLOutputType listType;
				String listName;
				if (List.class.isAssignableFrom(listClass)) {
					listName = name + "s";
					listType = new GraphQLList(objectType);
				} else {
					listName = GraphQLUtils.lowerCaseFirstLetter(listClass.getSimpleName());
					listType = buildTypeFromBean(listName, (Class<? extends IGraphQLBean>) resource.getBeanListClass());
				}
				GraphQLFieldDefinition listField = GraphQLFieldDefinition.newFieldDefinition()
					.type(listType)
					.name(listName)
					.argument(listFetcher.validArguments())
					.dataFetcher(listFetcher)
					.build();
				queryTypeBuilder.field(listField);
			}
		}

		//TODO: find a way to not have to do this.
		queryTypeBuilder.field(GraphQLFieldDefinition.newFieldDefinition()
				.type(buildTypeFromBean("reportPerson", ReportPerson.class))
				.name("reportPerson")
				.build());
		queryTypeBuilder.field(GraphQLFieldDefinition.newFieldDefinition()
				.type(buildTypeFromBean("comment", Comment.class))
				.name("comment")
				.build());
		queryTypeBuilder.field(GraphQLFieldDefinition.newFieldDefinition()
				.type(buildTypeFromBean("approvalAction", ApprovalAction.class))
				.name("approvalAction")
				.build());
		queryTypeBuilder.field(GraphQLFieldDefinition.newFieldDefinition()
				.type(buildTypeFromBean("personPositionHistory", PersonPositionHistory.class))
				.name("personPositionHistory")
				.build());

		GraphQLObjectType queryType = queryTypeBuilder.build();
		GraphQLSchema schmea = GraphQLSchema.newSchema()
			.query(queryType)
			.build();
		graphql = new GraphQL(schmea);
	}

	private GraphQLObjectType buildTypeFromBean(String name, Class<? extends IGraphQLBean> beanClazz) {
		GraphQLObjectType.Builder builder = GraphQLObjectType.newObject()
			.name(name);

		//Find all of the methods to use as Fields. Either getters, or @GraphQLFetcher annotated
		//Get a set of all unique names.
		Map<String,Type> methodReturnTypes = new HashMap<String,Type>();
		for (Method m : beanClazz.getMethods()) {
			String methodName = null;
			if (m.isAnnotationPresent(GraphQLIgnore.class)) { continue; }
			if (m.getName().startsWith("get")) {
				if (m.getName().equalsIgnoreCase("getClass")) { continue; }
				methodName = GraphQLUtils.lowerCaseFirstLetter(m.getName().substring(3));
			} else if (m.getName().startsWith("is")) {
				methodName = GraphQLUtils.lowerCaseFirstLetter(m.getName().substring(2));
			} else if (m.isAnnotationPresent(GraphQLFetcher.class)) {
				methodName = m.getAnnotation(GraphQLFetcher.class).value();
			}

			if (methodName != null) {
				methodReturnTypes.put(methodName, m.getGenericReturnType());
			}
		}

		for (Map.Entry<String, Type> entry : methodReturnTypes.entrySet()) {
			String fieldName = entry.getKey();
			Type retType = entry.getValue();
			try {
				builder.field(GraphQLUtils.buildFieldWithArgs(fieldName, retType, beanClazz));
			} catch (Exception e) {
				throw new RuntimeException(String.format("Unable to build GraphQL field %s on bean %s, error was %s",
						fieldName, beanClazz.getName(), e.getMessage()), e);
			}
		}

		return builder.build();
	}

	@POST
	public Response graphql(@Auth Person user, Map<String,Object> body) {
		if (developmentMode) {
			buildGraph();
		}
		String query = (String) body.get("query");
		Map<String, Object> variables = (Map<String, Object>) body.get("variables");
		if (variables == null) { variables = new HashMap<String,Object>(); }

		Map<String, Object> context = new HashMap<String,Object>();
		context.put("auth", user);

		ExecutionResult executionResult = graphql.execute(query, context, variables);
		Map<String, Object> result = new LinkedHashMap<>();
		if (executionResult.getErrors().size() > 0) {
			result.put("errors", executionResult.getErrors().stream()
					.map(e -> e.getMessage())
					.collect(Collectors.toList()));
			log.warn("Errors: {}", executionResult.getErrors());
			//TODO: pull out the errors and figure out the actual status code if it was thrown via a WebApplicationException
			return Response.status(Status.INTERNAL_SERVER_ERROR).entity(result).build();
		}
		result.put("data", executionResult.getData());
		return Response.ok().entity(result).build();
	}
}
