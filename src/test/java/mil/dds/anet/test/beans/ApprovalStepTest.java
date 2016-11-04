package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Group;

public class ApprovalStepTest extends BeanTester<ApprovalStep> {

	// DON'T USE THIS ANYWHERE ELSE!!
	// It has all the foreign keys filled it and is dangerous!  
	private static ApprovalStep getTestApprovalStep() {
		ApprovalStep as = new ApprovalStep();
		as.setId(42);
		as.setAdvisorOrganizationId(22);
		as.setApproverGroup(Group.createWithId(5));
		as.setNextStepId(9292);
		return as;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestApprovalStep(), "testJson/approvalSteps/testStep.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestApprovalStep(), "testJson/approvalSteps/testStep.json");
    }
	
}
