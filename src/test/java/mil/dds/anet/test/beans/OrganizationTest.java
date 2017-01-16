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
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestAO(), "testJson/organizations/test.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestAO(), "testJson/organizations/test.json");
    }
	
}

