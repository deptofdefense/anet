package mil.dds.anet.resources;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
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

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetEmailWorker;
import mil.dds.anet.AnetEmailWorker.AnetEmail;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.ApprovalAction.ApprovalType;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.ResponseUtils;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class ReportResource implements IGraphQLResource {

	ReportDao dao;
	AnetObjectEngine engine;

	private static Logger log = Log.getLogger(ReportResource.class);

	public ReportResource(AnetObjectEngine engine) {
		this.engine = engine;
		this.dao = engine.getReportDao();
	}
	
	@Override
	public String getDescription() { return "Reports"; } 
	
	@Override
	public Class<Report> getBeanClass() { return Report.class; } 
	
	@GET
	@Path("/")
	public Map<String,Object> getAllReportsView(@Auth Person p, @DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		Map<String,Object> result = new HashMap<String,Object>();
		result.put("reports", dao.getAll(pageNum, pageSize));
		result.put("myApprovals", AnetObjectEngine.getInstance().getReportDao().getReportsForMyApproval(p));
		result.put("myPending", AnetObjectEngine.getInstance().getReportDao().getMyReportsPendingApproval(p));
		return result;
	}

	@GET
	@Path("/{id}")
	@GraphQLFetcher
	public Report getById(@PathParam("id") Integer id) {
		return dao.getById(id);
	}
	

	@GET
	@Path("/new")
	public Map<String,Object> createNewReportForm(@Auth Person author) {
		Map<String,Object> result = new HashMap<String,Object>();
		result.put("efs", engine.getPoamDao().getPoamsByCategory("EF"));
		result.put("recentLocations", engine.getReportDao().getRecentLocations(author));
		result.put("recentPeople", engine.getReportDao().getRecentPeople(author));
		result.put("recentPoams", engine.getReportDao().getRecentPoams(author));
		return result;
	}

	@POST
	@Path("/new")
	public Report createNewReport(@Auth Person author, Report r) {
		if (r.getState() == null) { r.setState(ReportState.DRAFT); }
		if (r.getAuthor() == null) { r.setAuthor(author); }
		return dao.insert(r);
	}

	@POST
	@Path("/{id}/edit")
	public Response editReport(@Auth Person editor, Report r) {
		//Verify this person has access to edit this report
		//Either they are the author, or an approver for the current step.
		Report existing = dao.getById(r.getId());
		r.setState(existing.getState());
		r.setApprovalStep(existing.getApprovalStepJson());
		switch (existing.getState()) {
		case DRAFT:
			//Must be the author
			if (!existing.getAuthorJson().getId().equals(editor.getId())) {
				throw new WebApplicationException("Not the Author", Status.FORBIDDEN);
			}
			break;
		case PENDING_APPROVAL:
			//Either the author, or the approver
			if (existing.getAuthorJson().getId().equals(editor.getId())) {
				//This is okay, but move it back to draft
				r.setState(ReportState.DRAFT);
				r.setApprovalStep(null);
			} else {
				boolean canApprove = engine.canUserApproveStep(editor.getId(), existing.getApprovalStepJson().getId());
				if (!canApprove) {
					throw new WebApplicationException("Not the Approver", Status.FORBIDDEN);
				}
			}
			break;
		case RELEASED:
			throw new WebApplicationException("Cannot edit a released report", Status.FORBIDDEN);
		}
		r.setAuthor(existing.getAuthorJson());
		dao.update(r);
		//Update Attendees: Fetch the people associated with this report
		List<ReportPerson> existingPeople = dao.getAttendeesForReport(r.getId());
		List<Integer> existingPplIds = existingPeople.stream().map( rp -> rp.getId()).collect(Collectors.toList());
		//Find any differences and fix them.
		for (ReportPerson rp : r.getAttendees()) {
			int idx = existingPplIds.indexOf(rp.getId());
			if (idx == -1) { dao.addAttendeeToReport(rp, r); } else { existingPplIds.remove(idx);}
		}
		//Any ids left in existingPplIds needs to be removed.
		for (Integer id : existingPplIds) {
			dao.removeAttendeeFromReport(Person.createWithId(id), r);
		}

		//Update Poams:
		List<Poam> existingPoams = dao.getPoamsForReport(r);
		List<Integer> existingPoamIds = existingPoams.stream().map( p -> p.getId()).collect(Collectors.toList());
		for (Poam p : r.getPoamsJson()) {
			int idx = existingPoamIds.indexOf(p.getId());
			if (idx == -1) { dao.addPoamToReport(p, r); } else {  existingPoamIds.remove(idx); }
		}
		for (Integer id : existingPoamIds) {
			dao.removePoamFromReport(Poam.createWithId(id), r);
		}
		return Response.ok().build();
	}

	/* Submit a report for approval
	 * Kicks a report from DRAFT to PENDING_APPROVAL and sets the approval step Id
	 */
	@GET
	@Path("/{id}/submit")
	public Response submitReport(@PathParam("id") int id) {
		Report r = dao.getById(id);
		//TODO: this needs to be done by either the Author, a Superuser for the AO, or an Administrator

		Organization org = engine.getOrganizationForPerson(r.getAuthor());
		if (org == null ) {
			// Author missing Org, use the Default Approval Workflow
			org = Organization.createWithId(
				Integer.parseInt(engine.getAdminSetting(AdminSettingKeys.DEFAULT_APPROVAL_ORGANIZATION)));
		}
		List<ApprovalStep> steps = engine.getApprovalStepsForOrg(org);
		if (steps == null || steps.size() == 0) {
			//Missing approval steps for this organization
			steps = engine.getApprovalStepsForOrg(Organization.createWithId(-1));
		}

		//Push the report into the first step of this workflow
		r.setApprovalStep(steps.get(0));
		r.setState(ReportState.PENDING_APPROVAL);
		int numRows = dao.update(r);
		sendApprovalNeededEmail(r);
		
		return (numRows == 1) ? Response.ok().build() : ResponseUtils.withMsg("No records updated", Status.BAD_REQUEST);
	}

	private void sendApprovalNeededEmail(Report r) { 
		ApprovalStep step = r.getApprovalStep();
		Group approvalGroup = step.getApproverGroup();
		List<Person> approvers = approvalGroup.getMembers();
		AnetEmail approverEmail = new AnetEmail();
		approverEmail.setTemplateName("/emails/approvalNeeded.ftl");
		approverEmail.setSubject("ANET Report needs your approval");
		approverEmail.setToAddresses(approvers.stream().map(a -> a.getEmailAddress()).collect(Collectors.toList()));
		approverEmail.setContext(ImmutableMap.of("report", r, "approvalGroup", approvalGroup));
		AnetEmailWorker.sendEmailAsync(approverEmail);
	}
	
	/*
	 * Approve this report for the current step.
	 * TODO: this should run common approval code that checks if any previous approving users can approve the future steps
	 */
	@GET
	@Path("/{id}/approve")
	public Response approveReport(@Auth Person approver, @PathParam("id") int id) {
		Report r = dao.getById(id);
		if (r == null) {
			return Response.status(Status.NOT_FOUND).build();
		}
		if (r.getApprovalStep() == null) {
			log.info("Report ID {} does not currently need an approval", r.getId());
			return ResponseUtils.withMsg("No Approval Step Found", Status.BAD_REQUEST);
		}
		ApprovalStep step = engine.getApprovalStepDao().getById(r.getApprovalStep().getId());

		//Verify that this user can approve for this step.

		boolean canApprove = engine.canUserApproveStep(approver.getId(), step.getId());
		if (canApprove == false) {
			log.info("User ID {} cannot approve report ID {} for step ID {}",approver.getId(), r.getId(), step.getId());
			return Response.status(Status.FORBIDDEN).build();
		}

		//Write the approval
		//TODO: this should be in a transaction....
		ApprovalAction approval = new ApprovalAction();
		approval.setReport(r);
		approval.setStep(ApprovalStep.create(r.getApprovalStep().getId(), null, null, null));
		approval.setPerson(approver);
		approval.setType(ApprovalType.APPROVE);
		engine.getApprovalActionDao().insert(approval);

		//Update the report
		r.setApprovalStep(ApprovalStep.createWithId(step.getNextStepId()));
		if (step.getNextStepId() == null) {
			r.setState(ReportState.RELEASED);
		} else { 
			sendApprovalNeededEmail(r);
		}
		dao.update(r);
		//TODO: close the transaction.

		return Response.ok().build();
	}

	/**
	 * Rejects a report and moves it one step back in the approval process.
	 * @param id the Report ID to reject
	 * @param reason : A @link Comment object which will be posted to the report with the reason why the report was rejected.
	 * @return 200 on a successful reject, 401 if you don't have privelages to reject this report.
	 */
	@POST
	@Path("/{id}/reject")
	public Response rejectReport(@Auth Person approver, @PathParam("id") int id, Comment reason) {
		Report r = dao.getById(id);
		ApprovalStep step = engine.getApprovalStepDao().getById(r.getApprovalStep().getId());

		//Verify that this user can reject for this step.
		boolean canApprove = engine.canUserApproveStep(approver.getId(), step.getId());
		if (canApprove == false) {
			log.info("User ID {} cannot reject report ID {} for step ID {}",approver.getId(), r.getId(), step.getId());
			return Response.status(Status.FORBIDDEN).build();
		}

		//Write the rejection
		//TODO: This should be in a transaction
		ApprovalAction approval = new ApprovalAction();
		approval.setReport(r);
		approval.setStep(ApprovalStep.create(r.getApprovalStep().getId(), null, null, null));
		approval.setPerson(approver);
		approval.setType(ApprovalType.REJECT);
		engine.getApprovalActionDao().insert(approval);

		//Update the report
		ApprovalStep prevStep = engine.getApprovalStepDao().getStepByNextStepId(step.getId());
		if (prevStep == null) {
			r.setApprovalStep(null);
			r.setState(ReportState.DRAFT);
		} else {
			r.setApprovalStep(prevStep);
			sendApprovalNeededEmail(r);
		}
		dao.update(r);

		//Add the comment
		reason.setReportId(r.getId());
		reason.setAuthor(approver);
		engine.getCommentDao().insert(reason);

		//TODO: close the transaction.



		return Response.ok().build();
	}

	@POST
	@Path("/{id}/comments")
	public Comment postNewComment(@Auth Person author, @PathParam("id") int reportId, Comment comment) {
		comment.setReportId(reportId);
		comment.setAuthor(author);
		return engine.getCommentDao().insert(comment);
	}

	@GET
	@Path("/{id}/comments")
	public List<Comment> getCommentsForReport(@PathParam("id") int reportId) {
		return engine.getCommentDao().getCommentsForReport(Report.createWithId(reportId));
	}

	@DELETE
	@Path("/{id}/comments/{commentId}")
	public Response deleteComment(@PathParam("commentId") int commentId) {
		//TODO: user validation on /who/ is allowed to delete a comment.
		int numRows = engine.getCommentDao().delete(commentId);
		return (numRows == 1) ? Response.ok().build() : ResponseUtils.withMsg("Unable to delete comment", Status.NOT_FOUND);
	}

	@GET
	@Path("/pendingMyApproval")
	public List<Report> getReportsPendingMyApproval(@Auth Person approver) {
		return dao.getReportsForMyApproval(approver);
	}


	@GET
	@Path("/search")
	public List<Report> searchReports(@QueryParam("q") String query) {
		return dao.search(query);
	}

}
