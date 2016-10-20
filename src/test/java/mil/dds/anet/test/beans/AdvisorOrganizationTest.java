package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.AdvisorOrganization;

public class AdvisorOrganizationTest extends BeanTester<AdvisorOrganization> {

	public static AdvisorOrganization getTestAO() { 
		AdvisorOrganization ao = new AdvisorOrganization();
		ao.setName("The Best Advisors Ever");
		ao.setMemberGroupId(4);
		return ao;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestAO(), "testJson/advisorOrganizations/test.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestAO(), "testJson/advisorOrganizations/test.json");
    }
	
}
