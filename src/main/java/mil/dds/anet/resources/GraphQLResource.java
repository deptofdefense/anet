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

import org.apache.commons.lang3.mutable.MutableInt;
import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLSchema;
import io.dropwizard.auth.Auth;
import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.graphql.AnetResourceDataFetcher;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.graphql.IGraphQLBean;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.GraphQLUtils;
import mil.dds.anet.views.AbstractAnetBean;

@Path("/graphql")
@Produces(MediaType.APPLICATION_JSON)
public class GraphQLResource {

	private static Logger log = Log.getLogger(GraphQLResource.class);
	private GraphQL graphql;
	private List<IGraphQLResource> resources;
	
	public GraphQLResource(List<IGraphQLResource> resources) { 
		this.resources = resources;
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
				GraphQLFieldDefinition listField = GraphQLFieldDefinition.newFieldDefinition()
					.type(new GraphQLList(objectType))
					.name(name + "s")
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
		
		GraphQLObjectType queryType = queryTypeBuilder.build();
		
		GraphQLSchema schmea = GraphQLSchema.newSchema()
			.query(queryType)
			.build();
		graphql = new GraphQL(schmea);
	}
	
	private GraphQLObjectType buildTypeFromBean(String name, Class<? extends IGraphQLBean> beanClazz) { 
		GraphQLObjectType.Builder builder = GraphQLObjectType.newObject()
			.name(name);

		//Find all of the 'getter' methods to use as Fields.
		//Need to find all unique method names, and figure out which ones require arguments
		//If there are multiple methods named getXYZ, only want to register a single Field. 
		Map<String,MutableInt> getMethods = new HashMap<String,MutableInt>();
		Map<String,Type> methodReturnTypes = new HashMap<String,Type>();
		for (Method m : beanClazz.getMethods()) {
			if (m.getName().startsWith("get")) {
				if (m.getName().equalsIgnoreCase("getClass")) { continue; } 
				if (m.isAnnotationPresent(GraphQLIgnore.class)) { continue; }
				MutableInt ct = getMethods.get(m.getName());
				if (ct == null) { 
					ct = new MutableInt(0);
					getMethods.put(m.getName(), ct);
				}
				ct.add(1 + m.getParameterCount());
				methodReturnTypes.put(m.getName(), m.getGenericReturnType());
			}
		}
		
		//For any method with a count over 1, we need to support arguments
		for (Map.Entry<String, MutableInt> entry : getMethods.entrySet()) { 
			String fieldName = GraphQLUtils.lowerCaseFirstLetter(entry.getKey().substring(3));
			Type retType = methodReturnTypes.get(entry.getKey());
			if (entry.getValue().intValue() > 1) { 
				builder.field(GraphQLUtils.buildFieldWithArgs(fieldName, retType, beanClazz));
			} else { 
				//If count == 1 then this should be a no arguent method with a unique name.
				builder.field(GraphQLUtils.buildField(fieldName, retType));
			}
		}
		
		return builder.build();
	}
	
	@POST
	public Map<String,Object> graphql(@Auth Person user, Map<String,Object> body) {
		buildGraph();
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
	    }
	    result.put("data", executionResult.getData());
	    return result;
	}

	
	
}
