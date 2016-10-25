package mil.dds.anet.resources;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

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

import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.database.ApprovalStepDao;

@Path("/approvalSteps")
@Produces(MediaType.APPLICATION_JSON)
public class ApprovalStepResource {

	ApprovalStepDao dao;
	
	public ApprovalStepResource(ApprovalStepDao dao) { 
		this.dao = dao;
	}
	
	@GET
	@Path("/byAdvisorOrganization")
	public List<ApprovalStep> getStepsForOrg(@QueryParam("id") int id) { 
		Collection<ApprovalStep> unordered = dao.getByAdvisorOrganizationId(id);
		
		int numSteps = unordered.size();
		ArrayList<ApprovalStep> ordered = new ArrayList<ApprovalStep>(numSteps);
		Integer nextStep = null;
		for (int i=0;i<numSteps;i++) { 
			for (ApprovalStep as : unordered) { 
				if (Objects.equals(as.getNextStepId(), nextStep)) { 
					ordered.add(0, as);
					nextStep = as.getId();
					break;
				}
			}
		}
		return ordered;
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
