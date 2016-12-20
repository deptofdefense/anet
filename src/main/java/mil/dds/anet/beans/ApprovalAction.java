package mil.dds.anet.beans;

import java.util.Objects;

import javax.ws.rs.WebApplicationException;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.views.AbstractAnetBean;

public class ApprovalAction extends AbstractAnetBean {

	public enum ApprovalType {APPROVE, REJECT}
	
	ApprovalStep step;
	Person person;
	Report report;
	DateTime createdAt;
	ApprovalType type;
	
	@Override
	@JsonIgnore
	@GraphQLIgnore
	public Integer getId() { 
		throw new WebApplicationException("no ID field on Approval Action");
	}
	
	@JsonIgnore
	public ApprovalStep getStep() {
		if (step == null || step.getLoadLevel() == null) { return step; }
		if (step.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.step = AnetObjectEngine.getInstance()
					.getApprovalStepDao().getById(step.getId());
		}
		return step;
	}
	
	@JsonSetter("step")
	public void setStep(ApprovalStep step) {
		this.step = step;
	}
	
	@GraphQLIgnore
	@JsonGetter("step")
	public ApprovalStep getStepJson() { 
		return step;
	}
	
	@GraphQLIgnore
	@JsonGetter("person")
	public Person getPersonJson() {
		return person;
	}
	@JsonSetter("person")
	public void setPerson(Person person) {
		this.person = person;
	}
	@JsonIgnore
	public Person getPerson() { 
		if (person == null || person.getLoadLevel() == null) { return person; } 
		if (person.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.person = AnetObjectEngine.getInstance()
				.getPersonDao().getById(person.getId());
		}
		return person;
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
		return Objects.equals(step, other.getStepJson()) &&
				AbstractAnetBean.idEqual(person, other.getPersonJson()) &&
				Objects.equals(report, other.getReport()) &&
				Objects.equals(createdAt, other.getCreatedAt()) &&
				Objects.equals(type, other.getType());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(step, person, report, createdAt, type);
	}
	
	@Override
	public String toString() { 
		return String.format("[ApprovalAction: step:%d, type:%s, person:%d, report:%d]", step.getId(), type, person.getId(), report.getId());
	}
}
