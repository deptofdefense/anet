package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.BilletTest;
import mil.dds.anet.test.beans.TashkilTest;

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
		created.setAdvisorOrganization(AdvisorOrganization.createWithId(ao.getId()));
		
		Response resp = httpQuery("/billets/update").post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Billet returned = httpQuery(String.format("/billets/%d",created.getId())).get(Billet.class);
		assertThat(returned.getAdvisorOrganization().getId()).isEqualTo(ao.getId());
		
		//Assign a person into the billet
		Person jack = getJackJackson();
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
		Person steve = getSteveSteveson();
		resp = httpQuery(String.format("/billets/%d/advisor", returned.getId())).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify that the new person is in the billet
		curr = httpQuery(String.format("/billets/%d/advisor",returned.getId())).get(Person.class);
		assertThat(curr.getId()).isEqualTo(steve.getId());
		
		//Verify that the previous person is now no longer in a billet
		returned = httpQuery(String.format("/people/%d/billet", jack.getId())).get(Billet.class);
		assertThat(returned).isEqualTo(null);		
		
		//delete the person from this billet
		resp = httpQuery(String.format("/billets/%d/advisor", created.getId())).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		curr = httpQuery(String.format("/billets/%d/advisor",created.getId())).get(Person.class);
		assertThat(curr).isNull();
		
		//pull for the advisor at a previous time. 
		Person prev = httpQuery(String.format("/billets/%d/advisor?atTime=%d", created.getId(), jacksTime.getMillis()))
				.get(Person.class);
		assertThat(prev).isNotNull();
		assertThat(prev.getId()).isEqualTo(jack.getId());
		
		//Create a principal
		Person principal = getRogerRogwell();
		assertThat(principal.getId()).isNotNull();
		Tashkil t = httpQuery("/tashkils/new").post(Entity.json(TashkilTest.getTestTashkil()), Tashkil.class);
		assertThat(t.getId()).isNotNull();
		
		//put them in a tashkil
		resp = httpQuery(String.format("/tashkils/%d/principal", t.getId())).post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//assign the tashkil to the billet
		resp = httpQuery(String.format("/billets/%d/tashkils", created.getId())).post(Entity.json(t));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that we can pull the tashkil from the billet
		List<Tashkil> retT = httpQuery(String.format("/billets/%d/tashkils", created.getId())).get(new GenericType<List<Tashkil>> () {});
		assertThat(retT.size()).isEqualTo(1);
		assertThat(retT).contains(t);
		
		//delete the tashkil from this billet
		resp = httpQuery(String.format("/billets/%d/tashkils/%d", created.getId(), t.getId())).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that it's now gone. 
		retT = httpQuery(String.format("/billets/%d/tashkils", created.getId())).get(new GenericType<List<Tashkil>>() {});
		assertThat(retT.size()).isEqualTo(0);
	}	
}
