package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.ClassRule;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.testing.junit.DropwizardAppRule;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.BilletTest;
import mil.dds.anet.test.beans.PersonTest;

public class BilletResourceTest {

	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");
	
	public static Client client;
	
	public BilletResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("billets test client");
		}
	}
	
	@Test
	public void billetTest() { 
		//Create Billet
		Billet test = BilletTest.getTestBillet();
		
		Billet created = client.target(String.format("http://localhost:%d/billets/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(test), Billet.class);
		assertThat(created.getName()).isEqualTo(test.getName());
		
		//Assign to an AO
		AdvisorOrganization ao = client.target(String.format("http://localhost:%d/advisorOrganizations/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(AdvisorOrganizationTest.getTestAO()), AdvisorOrganization.class);
		created.setAdvisorOrganizationId(ao.getId());
		
		Response resp = client.target(String.format("http://localhost:%d/billets/update", RULE.getLocalPort()))
				.request()
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Billet returned = client.target(String.format("http://localhost:%d/billets/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(Billet.class);
		assertThat(returned.getAdvisorOrganizationId()).isEqualTo(ao.getId());
		
		//Assign a person into the billet
		Person jack = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(PersonTest.getJackJackson()), Person.class);
		assertThat(jack.getId()).isNotNull();
		resp = client.target(String.format("http://localhost:%d/billets/%d/advisor", RULE.getLocalPort(), created.getId()))
				.request()
				.post(Entity.json(jack));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//TODO: change the person in this billet
		//TODO: delete the person from this billet
		
		//TODO: pull for the advisor at a previous time. 
		 

	}
	
}
