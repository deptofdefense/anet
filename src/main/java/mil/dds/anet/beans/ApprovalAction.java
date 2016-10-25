package mil.dds.anet.beans;

import java.util.Objects;

import org.joda.time.DateTime;

public class ApprovalAction {

	public enum ApprovalType {APPROVE, REJECT}
	
	ApprovalStep step;
	Person person;
	Report report;
	DateTime createdAt;
	ApprovalType type;
	
	
	public ApprovalStep getStep() {
		return step;
	}
	public void setStep(ApprovalStep step) {
		this.step = step;
	}
	public Person getPerson() {
		return person;
	}
	public void setPerson(Person person) {
		this.person = person;
	}
	public Report getReport() {
		return report;
	}
	public void setReport(Report report) {
		this.report = report;
	}
	public DateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(DateTime createdAt) {
		this.createdAt = createdAt;
	}
	public ApprovalType getType() {
		return type;
	}
	public void setType(ApprovalType type) {
		this.type = type;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != ApprovalAction.class) { 
			return false;
		}
		ApprovalAction other = (ApprovalAction) o;
		return Objects.equals(step, other.getStep()) &&
				Objects.equals(person, other.getPerson()) &&
				Objects.equals(report, other.getReport()) &&
				Objects.equals(createdAt, other.getCreatedAt()) &&
				Objects.equals(type, other.getType());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(step, person, report, createdAt, type);
	}
}
