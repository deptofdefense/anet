package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.BilletTest;

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
		
		//update name of the AO
		created.setName("Ao McAoFace");
		Response resp = httpQuery("/advisorOrganizations/update")
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify the AO name is updated. 
		AdvisorOrganization updated = client.target(String.format("http://localhost:%d/advisorOrganizations/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(AdvisorOrganization.class);
		assertThat(updated.getName()).isEqualTo(created.getName());
		
		//Create a billet and put then in this AO
		Billet b1 = httpQuery("/billets/new").post(Entity.json(BilletTest.getTestBillet()), Billet.class);
		assertThat(b1.getId()).isNotNull();
		assertThat(b1.getAdvisorOrganization()).isNull();
		
		b1.setAdvisorOrganization(updated);
		resp = httpQuery("/billets/update").post(Entity.json(b1));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Billet ret = httpQuery(String.format("/billets/%d", b1.getId())).get(Billet.class);
		assertThat(ret.getAdvisorOrganization()).isNotNull();
		assertThat(ret.getAdvisorOrganization().getId()).isEqualTo(updated.getId());
				
		
	}
	
}
