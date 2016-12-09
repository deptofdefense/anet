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
import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.ApprovalAction.ApprovalType;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.beans.geo.Location;
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
	public ObjectListView<Report> getAllReportsView(@Auth Person p, @DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		ObjectListView<Report> view = new ObjectListView<Report>(dao.getAll(pageNum, pageSize), Report.class);
		List<Report> myApprovals = AnetObjectEngine.getInstance().getReportDao().getReportsForMyApproval(p);
		List<Report> myPending = AnetObjectEngine.getInstance().getReportDao().getMyReportsPendingApproval(p);
		view.addToContext("myApprovals", myApprovals);
		view.addToContext("myPending", myPending);
		return view;
	}

	@GET
	@Path("/{id}")
	@Produces({MediaType.TEXT_HTML, MediaType.APPLICATION_JSON})
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
	public Report createNewReportForm(@Auth Person author) {
		List<Poam> milestones = engine.getPoamDao().getPoamsByCategory("EF");
		List<Location> recentLocations = engine.getReportDao().getRecentLocations(author);
		Report r = (new Report()).render("form.ftl");
		r.addToContext("efs", milestones);
		r.addToContext("recentLocations", recentLocations);
		return r;
	}

	@POST
	@Path("/new")
	public Report createNewReport(@Auth Person author, Report r) {
		if (r.getState() == null) { r.setState(ReportState.DRAFT); }
		if (r.getAuthor() == null) { r.setAuthor(author); } 
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
			org = Organization.createWithId(-1); 
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
		return dao.getReportsForMyApproval(approver);
	}


	@GET
	@Path("/search")
	@Produces({MediaType.TEXT_HTML, MediaType.APPLICATION_JSON})
	public ObjectListView<Report> searchReports(@QueryParam("q") String query) {
		List<Report> list = Collections.emptyList();
		if (query != null && query.trim().length() > 0) {
			list = dao.search(query);
		}
		ObjectListView<Report> view = new ObjectListView<Report>(list, Report.class);
		return view.render("/views/report/search.ftl");
	}

}
