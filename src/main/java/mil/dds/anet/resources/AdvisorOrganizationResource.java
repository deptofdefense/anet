package mil.dds.anet.resources;

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
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.database.AdvisorOrganizationDao;
import mil.dds.anet.views.ObjectListView;

@Path("/advisorOrganizations")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class AdvisorOrganizationResource {

	private AdvisorOrganizationDao dao;
	private AnetObjectEngine engine; 
	
	public AdvisorOrganizationResource(AnetObjectEngine engine) {
		this.engine = engine;
		this.dao = engine.getAdvisorOrganizationDao(); 
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public ObjectListView<AdvisorOrganization> getAllOrgsView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new ObjectListView<AdvisorOrganization>(dao.getAll(pageNum, pageSize), AdvisorOrganization.class);
	} 
	
	@POST
	@Path("/new")
	public AdvisorOrganization createNewAdvisorOrganization(AdvisorOrganization ao) {
		return dao.insert(ao);
	}
	
	@GET
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public AdvisorOrganization getById(@PathParam("id") int id) {
		return dao.getById(id).render("show.ftl", engine);
	}
	
	@POST
	@Path("/update")
	public Response updateAdvisorOrganizationName(AdvisorOrganization ao) { 
		int numRows = dao.update(ao);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
}
