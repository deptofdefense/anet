package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;

public class OrganizationTest extends BeanTester<Organization> {

	public static Organization getTestAO() { 
		Organization ao = new Organization();
		ao.setShortName("TBAE");
		ao.setLongName("The Best Advisors Ever");
		ao.setType(OrganizationType.ADVISOR_ORG);
		return ao;
	}
	
	@Test
	public void serializesToJson() throws Exception {
		serializesToJson(getTestAO(), "testJson/organizations/test.json");
	}
	
	@Test
	public void deserializesFromJson() throws Exception {
		deserializesFromJson(getTestAO(), "testJson/organizations/test.json");
    }
	
}

