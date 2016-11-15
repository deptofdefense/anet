package mil.dds.anet.resources;

import java.util.Collections;
import java.util.List;
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

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.ApprovalAction.ApprovalType;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.utils.ResponseUtils;
import mil.dds.anet.views.ObjectListView;

@Path("/reports")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class ReportResource {

	ReportDao dao;
	AnetObjectEngine engine;
	
	private static Logger log = Log.getLogger(ReportResource.class);
	
	public ReportResource(AnetObjectEngine engine) {
		this.engine = engine;
		this.dao = engine.getReportDao();
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public ObjectListView<Report> getAllReportsView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new ObjectListView<Report>(dao.getAll(pageNum, pageSize), Report.class);
	}
	
	@GET
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public Report getById(@PathParam("id") int id) { 
		Report r =  dao.getById(id);
		if (r == null) { throw new WebApplicationException("No such report", Status.NOT_FOUND); } 
		r.render("show.ftl");
		r.addToContext("hello", "world");
		return r;
	}
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public Report createNewReportForm() { 
		List<Poam> milestones = engine.getPoamDao().getPoamsByCategory("EF");
		Report r = (new Report()).render("form.ftl");
		r.addToContext("efs", milestones);
		return r;
	}
	
	@POST
	@Path("/new")
	public Report createNewReport(@Auth Person author, Report r) { 
		if (r.getState() == null) { r.setState(ReportState.DRAFT); }
		r.setAuthor(author);
		return dao.insert(r);
	}
	
	@GET
	@Path("/{id}/edit")
	@Produces(MediaType.TEXT_HTML)
	public Report editReportForm(@PathParam("id") int id) { 
		Report r = dao.getById(id);
		List<Poam> milestones = engine.getPoamDao().getPoamsByCategory("EF");
		r.addToContext("efs", milestones);
		return r.render("form.ftl");
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
			if (existing.getAuthorJson().getId() != editor.getId()) { 
				throw new WebApplicationException("Not the Author", Status.FORBIDDEN);
			}
			break;
		case PENDING_APPROVAL:
			//Either the author, or the approver
			if (existing.getAuthorJson().getId() == editor.getId()) { 
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
		//Fetch the people associated with this report
		List<ReportPerson> existingPeople = dao.getAttendeesForReport(r.getId());
		List<Integer> existingPplIds = existingPeople.stream().map( rp -> rp.getId()).collect(Collectors.toList());
		//Find any differences and fix them. 
		for (ReportPerson rp : r.getAttendees()) {
			int idx = existingPplIds.indexOf(rp.getId());
			if (idx == -1) { 
				//Add this person s
				dao.addAttendeeToReport(rp, r);
			} else { 
				//This person already is in the DB
				existingPplIds.remove(idx);
			}
		}
		//Any ids left in existingPplIds needs to be removed.
		for (Integer id : existingPplIds) { 
			dao.removeAttendeeFromReport(id, r);
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
		
		AdvisorOrganization ao = engine.getAdvisorOrganizationForPerson(r.getAuthor());
		if (ao == null ) {
			return ResponseUtils.withMsg("Unable to find AO for Report Author", Status.BAD_REQUEST);
		}
		List<ApprovalStep> steps = engine.getApprovalStepsForOrg(ao);
		if (steps == null || steps.size() == 0) {  
			return ResponseUtils.withMsg("Unable to find approval steps for AO", Status.BAD_REQUEST);
		}
		
		//Push the report into the first step of this workflow
		r.setApprovalStep(steps.get(0));
		r.setState(ReportState.PENDING_APPROVAL);
		int numRows = dao.update(r);
		return (numRows == 1) ? Response.ok().build() : ResponseUtils.withMsg("No records updated", Status.BAD_REQUEST); 
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
		return dao.getReportsForApproval(approver);
	}
	
	@GET
	@Path("/search")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public ObjectListView<Report> searchReports(@QueryParam("q") String query) {
		List<Report> list = Collections.emptyList();
		if (query != null && query.trim().length() > 0) { 
			list = dao.search(query);
		}
		ObjectListView<Report> view = new ObjectListView<Report>(list, Report.class);
		return view.render("/views/report/search.ftl");
	}
	
}
