package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import mil.dds.anet.beans.geo.Location;

public class Report {

	public enum ReportState { DRAFT, PENDING_APPROVAL, RELEASED }

	
	Integer id;
	Integer approvalStepId;
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

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public Integer getApprovalStepId() {
		return approvalStepId;
	}

	public void setApprovalStepId(Integer approvalStepId) {
		this.approvalStepId = approvalStepId;
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

	public Location getLocation() {
		return location;
	}

	public void setLocation(Location location) {
		this.location = location;
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

	public Person getAuthor() {
		return author;
	}

	public void setAuthor(Person author) {
		this.author = author;
	}

	public List<Comment> getComments() {
		return comments;
	}

	public void setComments(List<Comment> comments) {
		this.comments = comments;
	}
	
	@Override
	public boolean equals(Object other) { 
		if (other == null || other.getClass() != Report.class) { 
			return false;
		}
		Report r = (Report) other;
		return Objects.equals(r.getId(), id) &&
				Objects.equals(r.getState(), state) &&
				Objects.equals(r.getApprovalStepId(), approvalStepId) &&
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
		return Objects.hash(id, state, approvalStepId, createdAt, updatedAt, 
			location, intent, exsum, principals, poams, reportText, 
			nextSteps, author, comments);
	}
}
