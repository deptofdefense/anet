package mil.dds.anet.beans;

import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.utils.DaoUtils;
import mil.dds.anet.views.AbstractAnetView;

public class ApprovalStep extends AbstractAnetView<ApprovalStep> {

	Group approverGroup;
	Integer nextStepId;
	Integer advisorOrganizationId;
	
	public static ApprovalStep create(Integer id, Group approverGroup, Integer nextStepId, Integer aoId) { 
		ApprovalStep as = new ApprovalStep();
		as.setId(id);
		as.setApproverGroup(approverGroup);
		as.setAdvisorOrganizationId(aoId);
		as.setNextStepId(nextStepId);
		return as;
	}
	
	@JsonIgnore
	public Group getApproverGroup() {
		if (approverGroup == null || approverGroup.getLoadLevel() == null) { return approverGroup; }
		if (approverGroup.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.approverGroup = AnetObjectEngine.getInstance()
					.getGroupDao().getById(approverGroup.getId());
		}
		return approverGroup;
	}
	
	@JsonGetter("approverGroup")
	public Group getApproverGroupJson() { 
		return approverGroup;
	}
	
	@JsonSetter
	public void setApproverGroup(Group approverGroup) {
		this.approverGroup = approverGroup;
	}
	public Integer getNextStepId() {
		return nextStepId;
	}
	public void setNextStepId(Integer nextStepId) {
		this.nextStepId = nextStepId;
	}
	public Integer getAdvisorOrganizationId() {
		return advisorOrganizationId;
	}
	public void setAdvisorOrganizationId(Integer advisorOrganizationId) {
		this.advisorOrganizationId = advisorOrganizationId;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != ApprovalStep.class) { 
			return false;
		}
		ApprovalStep as = (ApprovalStep) o;
		return Objects.equals(id, as.getId()) &&
			idEqual(approverGroup, as.getApproverGroupJson()) &&
			Objects.equals(nextStepId, as.getNextStepId()) &&
			Objects.equals(advisorOrganizationId, as.getAdvisorOrganizationId());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, approverGroup, nextStepId, advisorOrganizationId);
	}
	
	@Override
	public String toString() { 
		return String.format("%d - gid: %d, aoid: %d, nsid: %d", id, DaoUtils.getId(approverGroup), advisorOrganizationId, nextStepId);
	}

	public static ApprovalStep createWithId(Integer id) {
		ApprovalStep step = new ApprovalStep();
		step.setId(id);
		step.setLoadLevel(LoadLevel.ID_ONLY);
		return step;
	}
	
	
}
