package mil.dds.anet.beans;

import java.util.Objects;

public class ApprovalStep {

	Integer id;
	Integer approverGroupId;
	Integer nextStepId;
	Integer advisorOrganizationId;
	
	public static ApprovalStep create(Integer id, Integer approverGroupId, Integer nextStepId, Integer aoId) { 
		ApprovalStep as = new ApprovalStep();
		as.setId(id);
		as.setApproverGroupId(approverGroupId);
		as.setAdvisorOrganizationId(aoId);
		as.setNextStepId(nextStepId);
		return as;
	}
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Integer getApproverGroupId() {
		return approverGroupId;
	}
	public void setApproverGroupId(Integer approverGroupId) {
		this.approverGroupId = approverGroupId;
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
			Objects.equals(approverGroupId, as.getApproverGroupId()) &&
			Objects.equals(nextStepId, as.getNextStepId()) &&
			Objects.equals(advisorOrganizationId, as.getAdvisorOrganizationId());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, approverGroupId, nextStepId, advisorOrganizationId);
	}
	
	
}
