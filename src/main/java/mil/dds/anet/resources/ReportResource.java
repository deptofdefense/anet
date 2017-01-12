package mil.dds.anet.resources;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.annotation.security.PermitAll;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.ResponseUtils;
import mil.dds.anet.utils.Utils;

@Path("/api/reports")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class ReportResource implements IGraphQLResource {

	ReportDao dao;
	AnetObjectEngine engine;
	ObjectMapper mapper;

	private static Logger log = Log.getLogger(ReportResource.class);

	public ReportResource(AnetObjectEngine engine) {
		this.engine = engine;
		this.dao = engine.getReportDao();
		this.mapper = new ObjectMapper();
	}

	@Override
	public String getDescription() { return "Reports"; }

	@Override
	public Class<Report> getBeanClass() { return Report.class; }

	@GET
	@GraphQLFetcher
	@Path("/")
	public List<Report> getAll(@Auth Person p, @DefaultValue("0") @QueryParam("pageNum") Integer pageNum, @DefaultValue("100") @QueryParam("pageSize") Integer pageSize) {
		return dao.getAll(pageNum, pageSize);
	}

	@GET
	@Path("/{id}")
	@GraphQLFetcher
	public Report getById(@PathParam("id") Integer id) {
		return dao.getById(id);
	}

	@POST
	@Path("/new")
	public Report createNewReport(@Auth Person author, Report r) {
		if (r.getState() == null) { r.setState(ReportState.DRAFT); }
		if (r.getAuthor() == null) { r.setAuthor(author); }
	
		Person primaryAdvisor = findPrimaryAttendee(r, Role.ADVISOR);
		if (r.getAdvisorOrg() == null && primaryAdvisor != null) {
			r.setAdvisorOrg(engine.getOrganizationForPerson(primaryAdvisor));
		}
		Person primaryPrincipal = findPrimaryAttendee(r, Role.PRINCIPAL);
		if (r.getPrincipalOrg() == null && primaryPrincipal != null) {
			r.setPrincipalOrg(engine.getOrganizationForPerson(primaryPrincipal));
		}
		
		return dao.insert(r);
	}

	private Person findPrimaryAttendee(Report r, Role role) { 
		if (r.getAttendees() == null) { return null; } 
		return r.getAttendees().stream().filter(p ->
				p.isPrimary() && p.getRole().equals(role)
			).findFirst().orElse(null);
	}
	
	@POST
	@Path("/update")
	public Response editReport(@Auth Person editor, Report r) {
		//Verify this person has access to edit this report
		//Either they are the author, or an approver for the current step.
		Report existing = dao.getById(r.getId());
		r.setState(existing.getState());
		r.setApprovalStep(existing.getApprovalStep());
		r.setAuthor(existing.getAuthor());
		assertCanEditReport(r, editor);
		
		//If there is a change to the primary advisor, change the advisor Org. 
		Person primaryAdvisor = findPrimaryAttendee(r, Role.ADVISOR);
		if (Utils.idEqual(primaryAdvisor, existing.loadPrimaryAdvisor()) == false || existing.getAdvisorOrg() == null) { 
			r.setAdvisorOrg(engine.getOrganizationForPerson(primaryAdvisor));
		} else { 
			r.setAdvisorOrg(existing.getAdvisorOrg());
		}

		Person primaryPrincipal = findPrimaryAttendee(r, Role.PRINCIPAL);
		if (Utils.idEqual(primaryPrincipal, existing.loadPrimaryPrincipal()) ==  false || existing.getPrincipalOrg() == null) { 
			r.setPrincipalOrg(engine.getOrganizationForPerson(primaryPrincipal));
		} else { 
			r.setPrincipalOrg(existing.getPrincipalOrg());
		}
		
		dao.update(r);
		//Update Attendees: Fetch the people associated with this report
		List<ReportPerson> existingPeople = dao.getAttendeesForReport(r.getId());
		//Find any differences and fix them.
		for (ReportPerson rp : r.getAttendees()) {
			Optional<ReportPerson> existingPerson = existingPeople.stream().filter(el -> el.getId().equals(rp.getId())).findFirst();
			if (existingPerson.isPresent()) { 
				if (existingPerson.get().isPrimary() != rp.isPrimary()) { 
					dao.updateAttendeeOnReport(rp, r);
				}
				existingPeople.remove(existingPerson.get());
			} else { 
				dao.addAttendeeToReport(rp, r);
			}
		}
		//Any attendees left in existingPeople needs to be removed.
		for (ReportPerson rp : existingPeople) {
			dao.removeAttendeeFromReport(rp, r);
		}

		//Update Poams:
		List<Poam> existingPoams = dao.getPoamsForReport(r);
		List<Integer> existingPoamIds = existingPoams.stream().map( p -> p.getId()).collect(Collectors.toList());
		for (Poam p : r.getPoams()) {
			int idx = existingPoamIds.indexOf(p.getId());
			if (idx == -1) { dao.addPoamToReport(p, r); } else {  existingPoamIds.remove(idx); }
		}
		for (Integer id : existingPoamIds) {
			dao.removePoamFromReport(Poam.createWithId(id), r);
		}
		return Response.ok().build();
	}

	private void assertCanEditReport(Report report, Person editor) { 
		switch (report.getState()) {
		case DRAFT:
			//Must be the author
			if (!report.getAuthor().getId().equals(editor.getId())) {
				throw new WebApplicationException("Not the Author", Status.FORBIDDEN);
			}
			break;
		case PENDING_APPROVAL:
			//Either the author, or the approver
			if (report.getAuthor().getId().equals(editor.getId())) {
				//This is okay, but move it back to draft
				report.setState(ReportState.DRAFT);
				report.setApprovalStep(null);
			} else {
				boolean canApprove = engine.canUserApproveStep(editor.getId(), report.getApprovalStep().getId());
				if (!canApprove) {
					throw new WebApplicationException("Not the Approver", Status.FORBIDDEN);
				}
			}
			break;
		case RELEASED:
			throw new WebApplicationException("Cannot edit a released report", Status.FORBIDDEN);
		}
	}
	
	/* Submit a report for approval
	 * Kicks a report from DRAFT to PENDING_APPROVAL and sets the approval step Id
	 */
	@POST
	@Path("/{id}/submit")
	public Report submitReport(@PathParam("id") int id) {
		Report r = dao.getById(id);
		//TODO: this needs to be done by either the Author, a Superuser for the AO, or an Administrator

		if (r.getAdvisorOrg() == null) {
			ReportPerson advisor = r.loadPrimaryAdvisor();
			if (advisor == null) {
				throw new WebApplicationException("Report missing primary advisor", Status.BAD_REQUEST);
			}
			r.setAdvisorOrg(engine.getOrganizationForPerson(advisor));
		}
		if (r.getPrincipalOrg() == null) {
			ReportPerson principal = r.loadPrimaryPrincipal();
			if (principal == null) {
				throw new WebApplicationException("Report missing primary principal", Status.BAD_REQUEST);
			}
			r.setPrincipalOrg(engine.getOrganizationForPerson(principal));
		}

		if (r.getEngagementDate() == null) {
			throw new WebApplicationException("Missing engagement date", Status.BAD_REQUEST);
		}

		Organization org = engine.getOrganizationForPerson(r.getAuthor());
		if (org == null ) {
			// Author missing Org, use the Default Approval Workflow
			org = Organization.createWithId(
				Integer.parseInt(engine.getAdminSetting(AdminSettingKeys.DEFAULT_APPROVAL_ORGANIZATION)));
		}
		List<ApprovalStep> steps = engine.getApprovalStepsForOrg(org);
		if (steps == null || steps.size() == 0) {
			//Missing approval steps for this organization
			steps = engine.getApprovalStepsForOrg(
					Organization.createWithId(Integer.parseInt(engine.getAdminSetting(AdminSettingKeys.DEFAULT_APPROVAL_ORGANIZATION))));
		}

		//Push the report into the first step of this workflow
		r.setApprovalStep(steps.get(0));
		r.setState(ReportState.PENDING_APPROVAL);
		int numRows = dao.update(r);
		sendApprovalNeededEmail(r);
		log.info("Putting report {} into step {} because of org {} on author {}",
				r.getId(), steps.get(0).getId(), org.getId(), r.getAuthor().getId());

		if (numRows != 1) {
			throw new WebApplicationException("No records updated", Status.BAD_REQUEST);
		}

		return r;
	}

	private void sendApprovalNeededEmail(Report r) {
		ApprovalStep step = r.loadApprovalStep();
		Group approvalGroup = step.loadApproverGroup();
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
	@POST
	@Path("/{id}/approve")
	public Report approveReport(@Auth Person approver, @PathParam("id") int id) {
		Report r = dao.getById(id);
		if (r == null) {
			throw new WebApplicationException("Report not found", Status.NOT_FOUND);
		}
		if (r.getApprovalStep() == null) {
			log.info("Report ID {} does not currently need an approval", r.getId());
			throw new WebApplicationException("No approval step found", Status.NOT_FOUND);
		}
		ApprovalStep step = r.loadApprovalStep();

		//Verify that this user can approve for this step.

		boolean canApprove = engine.canUserApproveStep(approver.getId(), step.getId());
		if (canApprove == false) {
			log.info("User ID {} cannot approve report ID {} for step ID {}",approver.getId(), r.getId(), step.getId());
			throw new WebApplicationException("User cannot approve report", Status.FORBIDDEN);
		}

		//Write the approval
		//TODO: this should be in a transaction....
		ApprovalAction approval = new ApprovalAction();
		approval.setReport(r);
		approval.setStep(ApprovalStep.create(step.getId(), null, null, null));
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

		return r;
	}

	/**
	 * Rejects a report and moves it one step back in the approval process.
	 * @param id the Report ID to reject
	 * @param reason : A @link Comment object which will be posted to the report with the reason why the report was rejected.
	 * @return 200 on a successful reject, 401 if you don't have privelages to reject this report.
	 */
	@POST
	@Path("/{id}/reject")
	public Report rejectReport(@Auth Person approver, @PathParam("id") int id, Comment reason) {
		Report r = dao.getById(id);
		ApprovalStep step = r.loadApprovalStep();

		//Verify that this user can reject for this step.
		boolean canApprove = engine.canUserApproveStep(approver.getId(), step.getId());
		if (canApprove == false) {
			log.info("User ID {} cannot reject report ID {} for step ID {}",approver.getId(), r.getId(), step.getId());
			throw new WebApplicationException("User cannot approve report", Status.FORBIDDEN);
		}

		//Write the rejection
		//TODO: This should be in a transaction
		ApprovalAction approval = new ApprovalAction();
		approval.setReport(r);
		approval.setStep(ApprovalStep.create(step.getId(), null, null, null));
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

		return r;
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
	@GraphQLFetcher("pendingMyApproval")
	@Path("/pendingMyApproval")
	public List<Report> getReportsPendingMyApproval(@Auth Person approver) {
		return dao.getReportsForMyApproval(approver);
	}

	@GET
	@Path("/search")
	public List<Report> search(@Context HttpServletRequest request) {
		try {
			return search(ResponseUtils.convertParamsToBean(request, ReportSearchQuery.class));
		} catch (IllegalArgumentException e) {
			throw new WebApplicationException(e.getMessage(), e.getCause(), Status.BAD_REQUEST);
		}
	}

	@POST
	@GraphQLFetcher
	@Path("/search")
	public List<Report> search(@GraphQLParam("query") ReportSearchQuery query) {
		return dao.search(query);
	}

}
