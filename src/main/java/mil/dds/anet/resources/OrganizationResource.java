package mil.dds.anet.resources;

import java.util.List;

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
	
	public OrganizationResource(AnetObjectEngine engine) {
		this.dao = engine.getOrganizationDao(); 
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
	
	@POST
	@Path("/new")
	@RolesAllowed("ADMINISTRATOR")
	public Organization createNewAdvisorOrganization(Organization ao, @Auth Person user) {
		AuthUtils.assertAdministrator(user);
		return dao.insert(ao);
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
	public Response updateAdvisorOrganizationName(Organization ao, @Auth Person user) { 
		//Verify correct Organization 
		AuthUtils.assertSuperUserForOrg(user, ao);
		
		int numRows = dao.update(ao);
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
		return dao.getByParentOrgId(id);
	}
	
	@GET
	@Path("/{id}/poams")
	public List<Poam> getPoams(@PathParam("id") Integer orgId) { 
		return AnetObjectEngine.getInstance().getPoamDao().getPoamsByOrganizationId(orgId);
	}
}
