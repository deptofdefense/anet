package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.test.beans.PersonTest;
import mil.dds.anet.test.beans.TashkilTest;

public class TashkilResourceTest extends AbstractResourceTest {
	
	public TashkilResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("groups test client");
		}
	}
	
	@Test
	public void tashkilTest() { 
		//Create Tashkil
		Tashkil t = TashkilTest.getTestTashkil();
		
		Tashkil created = httpQuery("/tashkils/new").post(Entity.json(t), Tashkil.class);
		assertThat(created.getName()).isEqualTo(t.getName());
		assertThat(created.getCode()).isEqualTo(t.getCode());
		assertThat(created.getId()).isNotNull();
		
		//Change Name/Code
		created.setName("Deputy Chief of Donuts");
		Response resp = client.target(String.format("http://localhost:%d/tashkils/update", RULE.getLocalPort()))
				.request()
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Tashkil returned = client.target(String.format("http://localhost:%d/tashkils/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(Tashkil.class);
		assertThat(returned.getName()).isEqualTo(created.getName());
		assertThat(returned.getCode()).isEqualTo(created.getCode());
		
		//Assign Principal
		Person principal = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
               .request()
               .post(Entity.json(PersonTest.getJackJackson()), Person.class);
		
		resp = client.target(String.format("http://localhost:%d/tashkils/%d/principal", RULE.getLocalPort(), created.getId()))
				.request()
				.post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person returnedPrincipal = client.target(String.format("http://localhost:%d/tashkils/%d/principal", RULE.getLocalPort(), created.getId()))
				.request()
				.get(Person.class);
		assertThat(returnedPrincipal.getId()).isEqualTo(principal.getId());
		
		//TODO: Change the Principal
		
	}
	
}
