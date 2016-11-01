package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;

public class AdvisorOrganizationResourceTest extends AbstractResourceTest {

	public AdvisorOrganizationResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("ao test client");
		}
	}
	
	@Test
	public void createAO() { 
		AdvisorOrganization ao = AdvisorOrganizationTest.getTestAO();
		
		//Create a new AO
		AdvisorOrganization created = httpQuery("/advisorOrganizations/new")
			.post(Entity.json(ao), AdvisorOrganization.class);
		assertThat(ao.getName()).isEqualTo(created.getName());
		assertThat(created.getMemberGroupId()).isNotNull();
		
		System.out.println("AO id: " + created.getId());
		System.out.println("Member Group Id : " + created.getMemberGroupId());
		
		//Find the Group it just created
		Group aoGroup = httpQuery(String.format("/groups/%d", created.getMemberGroupId())).get(Group.class);
		assertThat(aoGroup.getName()).startsWith(created.getName());
		
		//update name of the AO
		created.setName("Ao McAoFace");
		Response resp = httpQuery("/advisorOrganizations/update")
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify the AO name and the Group name is updated. 
		AdvisorOrganization updated = client.target(String.format("http://localhost:%d/advisorOrganizations/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(AdvisorOrganization.class);
		assertThat(updated.getName()).isEqualTo(created.getName());
		
		aoGroup = client.target(String.format("http://localhost:%d/groups/%d", RULE.getLocalPort(), updated.getMemberGroupId()))
				.request()
				.get(Group.class);
		assertThat(aoGroup.getName()).startsWith(updated.getName());
		
		//Put some people in this AO
		Person p1 = getJackJackson();
		resp = client.target(String.format("http://localhost:%d/groups/%d/addMember?personId=%d", RULE.getLocalPort(), aoGroup.getId(), p1.getId()))
			.request()
			.get();
		Person p2 = getSteveSteveson();
		resp = client.target(String.format("http://localhost:%d/groups/%d/addMember?personId=%d", RULE.getLocalPort(), aoGroup.getId(), p2.getId()))
				.request()
				.get();
	}
	
}
