package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.ApprovalStepDao;
import mil.dds.anet.utils.AuthUtils;

@Path("/api/approvalSteps")
@Produces(MediaType.APPLICATION_JSON)
public class ApprovalStepResource {

	AnetObjectEngine engine;
	ApprovalStepDao dao;
	
	public ApprovalStepResource(AnetObjectEngine engine) {
		this.engine = engine;
		this.dao = engine.getApprovalStepDao();
	}
	
	@GET
	@Path("/byOrganization")
	public List<ApprovalStep> getStepsForOrg(@QueryParam("id") int id) {
		Organization ao = new Organization();
		ao.setId(id);
		return engine.getApprovalStepsForOrg(ao);
	}
	
	@POST
	@Path("/new")
	@RolesAllowed("SUPER_USER")
	public ApprovalStep createNewStep(@Auth Person user, ApprovalStep as) {
		AuthUtils.assertSuperUserForOrg(user, Organization.createWithId(as.getAdvisorOrganizationId()));
		return dao.insert(as);
	}
	
	@POST
	@Path("/update")
	@RolesAllowed("SUPER_USER")
	public int updateSteps(@Auth Person user, List<ApprovalStep> as) {
		//Ensure that all approvalSteps have the same organizationId. 
		int orgId = as.get(0).getAdvisorOrganizationId();
		for (ApprovalStep step : as) { 
			if (step.getAdvisorOrganizationId() != orgId) { 
				throw new WebApplicationException("Approval Steps must all belong to the same organization", Status.BAD_REQUEST);
			}
		}
		
		AuthUtils.assertSuperUserForOrg(user, Organization.createWithId(orgId));
		for (ApprovalStep step : as) { 
			dao.update(step);
		}
		return as.size();
	}
	
	@DELETE
	@Path("/{id}")
	//TODO: Permissions
	public Response deleteStep(@PathParam("id") int id) {
		boolean success = dao.deleteStep(id);
		return (success) ? Response.ok().build() : Response.status(Status.NOT_ACCEPTABLE).build();
	}
}
