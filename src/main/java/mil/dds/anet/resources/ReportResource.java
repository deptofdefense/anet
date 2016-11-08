package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DELETE;
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
		Report r =  dao.getById(id).render("show.ftl");
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
}
