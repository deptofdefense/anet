package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.views.ObjectListView;

@Path("/organizations")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class OrganizationResource {

	private OrganizationDao dao;
	
	public OrganizationResource(AnetObjectEngine engine) {
		this.dao = engine.getOrganizationDao(); 
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public ObjectListView<Organization> getAllOrgsView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new ObjectListView<Organization>(dao.getAll(pageNum, pageSize), Organization.class);
	} 
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public Organization getOrganizationForm() { 
		return (new Organization()).render("form.ftl");
	}
	
	@POST
	@Path("/new")
	public Organization createNewAdvisorOrganization(Organization ao) {
		return dao.insert(ao);
	}
	
	@GET
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public Organization getById(@PathParam("id") int id) {
		return dao.getById(id).render("show.ftl");
	}
	
	@GET
	@Path("/{id}/edit")
	@Produces(MediaType.TEXT_HTML)
	public Organization getEditForm(@PathParam("id") int id) { 
		return dao.getById(id).render("form.ftl");
	}
	
	@POST
	@Path("/update")
	public Response updateAdvisorOrganizationName(Organization ao) { 
		int numRows = dao.update(ao);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	@GET
	@Path("/search")
	public List<Organization> search(@QueryParam("q") String name, @QueryParam("type") OrganizationType type) {
		return dao.searchByName(name, type);
	}
	
	@GET
	@Path("/{id}/children")
	public List<Organization> getChildren(@PathParam("id") Integer id) { 
		return dao.getByParentOrgId(id);
	}
}
