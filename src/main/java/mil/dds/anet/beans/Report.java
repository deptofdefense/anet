package mil.dds.anet.beans;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.views.AbstractAnetView;

public class Report extends AbstractAnetView<Report> {

	public enum ReportState { DRAFT, PENDING_APPROVAL, RELEASED }

	ApprovalStep approvalStep;
	ReportState state;
	
	DateTime createdAt;
	DateTime updatedAt;
	Location location;
	String intent;
	String exsum; //can be null to autogenerate
	
	List<Person> principals;
	List<Poam> poams;
	
	String reportText;
	String nextSteps;
	
	Person author;	
	
	List<Comment> comments;

	@JsonGetter("approvalStep")
	public ApprovalStep getApprovalStepJson() {
		return approvalStep;
	}

	@JsonSetter("approvalStep")
	public void setApprovalStep(ApprovalStep approvalStep) {
		this.approvalStep = approvalStep;
	}

	@JsonIgnore
	public ApprovalStep getApprovalStep() { 
		if (approvalStep == null || approvalStep.getLoadLevel() == null) { return approvalStep; } 
		if (approvalStep.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.approvalStep = AnetObjectEngine.getInstance()
				.getApprovalStepDao().getById(approvalStep.getId());
		}
		return approvalStep;
	}
	
	public ReportState getState() {
		return state;
	}

	public void setState(ReportState state) {
		this.state = state;
	}

	public DateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(DateTime createdAt) {
		this.createdAt = createdAt;
	}

	public DateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(DateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	@JsonIgnore
	public Location getLocation() {
		if (location == null || location.getLoadLevel() == null) { return location; } 
		if (location.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.location = AnetObjectEngine.getInstance()
					.getLocationDao().getById(location.getId());
		}
		return location;
	}

	@JsonSetter("location")
	public void setLocation(Location location) {
		this.location = location;
	}
	
	@JsonGetter("location")
	public Location getLocationJson() { 
		return location;
	}

	public String getIntent() {
		return intent;
	}

	public String getExsum() {
		return exsum;
	}

	public void setExsum(String exsum) {
		this.exsum = exsum;
	}

	public void setIntent(String intent) {
		this.intent = intent;
	}

	public List<Person> getPrincipals() {
		return principals;
	}

	public void setPrincipals(List<Person> principals) {
		this.principals = principals;
	}

	public List<Poam> getPoams() {
		return poams;
	}

	public void setPoams(List<Poam> poams) {
		this.poams = poams;
	}

	public String getReportText() {
		return reportText;
	}

	public void setReportText(String reportText) {
		this.reportText = reportText;
	}

	public String getNextSteps() {
		return nextSteps;
	}

	public void setNextSteps(String nextSteps) {
		this.nextSteps = nextSteps;
	}

	@JsonIgnore
	public Person getAuthor() {
		if (author == null ) { return null; } 
		if (author.getLoadLevel() == null) { return author; } 
		if (author.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.author = getBeanAtLoadLevel(author, LoadLevel.PROPERTIES);
		}
		return author;
	}

	@JsonSetter("author")
	public void setAuthor(Person author) {
		this.author = author;
	}
	
	@JsonGetter("author")
	public Person getAuthorJson() { 
		return author;
	}

	public List<Comment> getComments() {
		return comments;
	}

	public void setComments(List<Comment> comments) {
		this.comments = comments;
	}
	
	/*Returns a full list of the approval steps and statuses for this report
	 * There will be an approval action for each approval step for this report
	 * With information about the 
	 */
	@JsonIgnore
	public List<ApprovalAction> getApprovalStatus() { 
		AnetObjectEngine engine = AnetObjectEngine.getInstance();
		AdvisorOrganization ao = engine.getAdvisorOrganizationForPerson(getAuthor());
		List<ApprovalStep> steps = engine.getApprovalStepsForOrg(ao);
		
		List<ApprovalAction> actions = engine.getApprovalActionDao().getFinalActionsForReport(this.getId());
		
		List<ApprovalAction> workflow = new LinkedList<ApprovalAction>();
		for (ApprovalStep step : steps) { 
			//If there is an Action for this step, grab it and record this.
			Optional<ApprovalAction> existing = actions.stream().filter(a -> 
					a.getStep().getId().equals(step.getId())
				).findFirst();
			ApprovalAction action;
			if (existing.isPresent()) { 
				action = existing.get();
			} else { 
				//If not then create a new one and attach this step
				action = new ApprovalAction();		
			}
			action.setStep(step);
			workflow.add(action);
		}
		return workflow;
	}
	
	@Override
	public boolean equals(Object other) { 
		if (other == null || other.getClass() != Report.class) { 
			return false;
		}
		Report r = (Report) other;
		return Objects.equals(r.getId(), id) &&
				Objects.equals(r.getState(), state) &&
				Objects.equals(r.getApprovalStep(), approvalStep) &&
				Objects.equals(r.getCreatedAt(), createdAt) &&
				Objects.equals(r.getUpdatedAt(), updatedAt) &&
				Objects.equals(r.getLocation(), location) &&
				Objects.equals(r.getIntent(), intent) &&
				Objects.equals(r.getExsum(), exsum) &&
				Objects.equals(r.getPrincipals(), principals) &&
				Objects.equals(r.getPoams(), poams) &&
				Objects.equals(r.getReportText(), reportText) &&
				Objects.equals(r.getNextSteps(), nextSteps) &&
				Objects.equals(r.getAuthor(), author) &&
				Objects.equals(r.getComments(), comments);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, state, approvalStep, createdAt, updatedAt, 
			location, intent, exsum, principals, poams, reportText, 
			nextSteps, author, comments);
	}

	public static Report createWithId(Integer id) {
		Report r = new Report();
		r.setId(id);
		r.setLoadLevel(LoadLevel.ID_ONLY);
		return r;
	}
}
