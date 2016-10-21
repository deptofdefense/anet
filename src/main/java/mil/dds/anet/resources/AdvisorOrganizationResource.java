package mil.dds.anet.resources;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.database.AdvisorOrganizationDao;

@Path("/advisorOrganizations")
@Produces(MediaType.APPLICATION_JSON)
public class AdvisorOrganizationResource {

	private AdvisorOrganizationDao dao;
	
	public AdvisorOrganizationResource(AdvisorOrganizationDao dao) {
		this.dao = dao; 
	}
	
	
	@POST
	@Path("/new")
	public AdvisorOrganization createNewAdvisorOrganization(AdvisorOrganization ao) {
		return dao.createNewAdvisorOrganization(ao);
	}
	
	@GET
	@Path("/{id}")
	public AdvisorOrganization getById(@PathParam("id") int id) {
		return dao.getAdvisorOrgById(id);
	}
	
	@POST
	@Path("/update")
	public Response updateAdvisorOrganizationName(AdvisorOrganization ao) { 
		int numRows = dao.updateAdvisorOrganizationName(ao);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
}
