package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.BilletTest;
import mil.dds.anet.test.beans.PersonTest;

public class BilletResourceTest extends AbstractResourceTest {

	public BilletResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("billets test client");
		}
	}
	
	@Test
	public void billetTest() { 
		//Create Billet
		Billet test = BilletTest.getTestBillet();
		
		Billet created = httpQuery("/billets/new").post(Entity.json(test), Billet.class);
		assertThat(created.getName()).isEqualTo(test.getName());
		
		//Assign to an AO
		AdvisorOrganization ao = httpQuery("/advisorOrganizations/new")
				.post(Entity.json(AdvisorOrganizationTest.getTestAO()), AdvisorOrganization.class);
		created.setAdvisorOrganizationId(ao.getId());
		
		Response resp = httpQuery("/billets/update").post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Billet returned = httpQuery(String.format("/billets/%d",created.getId())).get(Billet.class);
		assertThat(returned.getAdvisorOrganizationId()).isEqualTo(ao.getId());
		
		//Assign a person into the billet
		Person jack = httpQuery("/people/new").post(Entity.json(PersonTest.getJackJackson()), Person.class);
		assertThat(jack.getId()).isNotNull();
		resp = httpQuery(String.format("/billets/%d/advisor", created.getId())).post(Entity.json(jack));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person curr = httpQuery(String.format("/billets/%d/advisor",returned.getId())).get(Person.class);
		assertThat(curr.getId()).isEqualTo(jack.getId());
		
		DateTime jacksTime = DateTime.now();
		try {
			Thread.sleep(500);//just slow me down a bit...
		} catch (InterruptedException e) {}  
		
		//change the person in this billet
		Person steve = httpQuery("/people/new").post(Entity.json(PersonTest.getSteveSteveson()), Person.class);
		resp = httpQuery(String.format("/billets/%d/advisor", returned.getId())).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		curr = httpQuery(String.format("/billets/%d/advisor",returned.getId())).get(Person.class);
		assertThat(curr.getId()).isEqualTo(steve.getId());
		
		//delete the person from this billet
		resp = httpQuery(String.format("/billets/%d/advisor", returned.getId())).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		curr = httpQuery(String.format("/billets/%d/advisor",returned.getId())).get(Person.class);
		assertThat(curr).isNull();
		
		//pull for the advisor at a previous time. 
		Person prev = httpQuery(String.format("/billets/%d/advisor?atTime=%d", returned.getId(), jacksTime.getMillis()))
				.get(Person.class);
		assertThat(prev).isNotNull();
		assertThat(prev.getId()).isEqualTo(jack.getId());

	}
	
}
