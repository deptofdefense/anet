package mil.dds.anet.resources;

import java.util.List;

import javax.ws.rs.DELETE;
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
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.database.ApprovalStepDao;

@Path("/approvalSteps")
@Produces(MediaType.APPLICATION_JSON)
public class ApprovalStepResource {

	AnetObjectEngine engine;
	ApprovalStepDao dao;
	
	public ApprovalStepResource(AnetObjectEngine engine) {
		this.engine = engine;
		this.dao = engine.getApprovalStepDao();
	}
	
	@GET
	@Path("/byAdvisorOrganization")
	public List<ApprovalStep> getStepsForOrg(@QueryParam("id") int id) {
		AdvisorOrganization ao = new AdvisorOrganization();
		ao.setId(id);
		return engine.getApprovalStepsForOrg(ao);
	}
	
	@POST
	@Path("/new")
	public ApprovalStep createNewStep(ApprovalStep as) { 
		int id = dao.createNewApprovalStep(as);
		as.setId(id);
		return as;
	}
	
	@POST
	@Path("/update")
	public int updateSteps(List<ApprovalStep> as) {
		for (ApprovalStep step : as) { 
			dao.updateApprovalStep(step);
		}
		return as.size();
	}
	
	@DELETE
	@Path("/{id}")
	public Response deleteStep(@PathParam("id") int id) { 
		boolean success = dao.deleteStep(id);
		return (success) ? Response.ok().build() : Response.status(Status.NOT_ACCEPTABLE).build();
	}
}
