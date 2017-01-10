package mil.dds.anet.resources;

import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.AuthUtils;
import mil.dds.anet.utils.ResponseUtils;

@Path("/api/organizations")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class OrganizationResource implements IGraphQLResource {

	private OrganizationDao dao;
	private AnetObjectEngine engine;
	
	public OrganizationResource(AnetObjectEngine engine) {
		this.dao = engine.getOrganizationDao(); 
		this.engine = engine;
	}
	
	@Override
	public Class<Organization> getBeanClass() { return Organization.class; }
	
	@Override
	public String getDescription() { return "Organizations"; } 
	
	@GET
	@GraphQLFetcher
	@Path("/")
	public List<Organization> getAllOrgs(@DefaultValue("0") @QueryParam("pageNum") Integer pageNum, @DefaultValue("100") @QueryParam("pageSize") Integer pageSize) {
		return dao.getAll(pageNum, pageSize);
	} 

	@GET
	@GraphQLFetcher
	@Path("/topLevel")
	public List<Organization> getTopLevelOrgs(@QueryParam("type") OrganizationType type) { 
		return dao.getTopLevelOrgs(type);
	}
	
	@POST
	@Path("/new")
	@RolesAllowed("ADMINISTRATOR")
	public Organization createNewOrganization(Organization org, @Auth Person user) {
		AuthUtils.assertAdministrator(user); 
		Organization created = dao.insert(org);
		
		if (org.getPoams() != null) { 
			//Assign all of these poams to this organization. 
			for (Poam p : org.getPoams()) { 
				engine.getPoamDao().setResponsibleOrgForPoam(p, created);
			}
		}
		//TODO: Check for approval Steps and create them now. 
		
		return created; 
	}
	
	@GET
	@GraphQLFetcher
	@Path("/{id}")
	public Organization getById(@PathParam("id") int id) {
		return dao.getById(id);
	}
	
	@POST
	@Path("/update")
	@RolesAllowed("SUPER_USER")
	public Response updateAdvisorOrganizationName(Organization org, @Auth Person user) { 
		//Verify correct Organization 
		AuthUtils.assertSuperUserForOrg(user, org);
		
		int numRows = dao.update(org);
		
		if (org.getPoams() != null) {
			Organization existing = dao.getById(org.getId());
			
			List<Integer> existingIds = existing.loadPoams().stream().map(p -> p.getId()).collect(Collectors.toList());			
			for (Poam newPoam : org.getPoams()) { 
				if (existingIds.remove(newPoam.getId()) == false) { 
					//Add this poam
					engine.getPoamDao().setResponsibleOrgForPoam(newPoam, existing);
				}
			}
			
			//Now remove all items in existingIds. 
			for (Integer id : existingIds) {
				engine.getPoamDao().setResponsibleOrgForPoam(Poam.createWithId(id), null);
			}
		}
		//TODO: check for update to poams and approval steps
		
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	@POST
	@GraphQLFetcher
	@Path("/search")
	public List<Organization> search(@GraphQLParam("query") OrganizationSearchQuery query ) {
		return dao.search(query);
	}
	
	@GET
	@Path("/search")
	public List<Organization> search(@Context HttpServletRequest request) {
		try { 
			return search(ResponseUtils.convertParamsToBean(request, OrganizationSearchQuery.class));
		} catch (IllegalArgumentException e) { 
			throw new WebApplicationException(e.getMessage(), e.getCause(), Status.BAD_REQUEST);
		}
	}
	
	@GET
	@Path("/{id}/children")
	public List<Organization> getChildren(@PathParam("id") Integer id) { 
		return dao.getByParentOrgId(id, null);
	}
	
	@GET
	@Path("/{id}/poams")
	public List<Poam> getPoams(@PathParam("id") Integer orgId) { 
		return AnetObjectEngine.getInstance().getPoamDao().getPoamsByOrganizationId(orgId);
	}
}
