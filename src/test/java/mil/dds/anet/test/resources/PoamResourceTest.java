package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;

import org.assertj.core.api.Assertions;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Poam;

public class PoamResourceTest extends AbstractResourceTest {

	public PoamResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("poam test client");
		}
	}
	
	@Test
	public void implementMe() { 
		Assertions.fail("Poam Resource Test not implemented");
	}
	
	@Test
	public void poamTest() { 
		Poam a = httpQuery("/poams/new")
			.post(Entity.json(Poam.create("M1", "Do a thing with a person", "Milestone")), Poam.class);
		assertThat(a.getId()).isNotNull();
				
		Poam b = httpQuery("/poams/new")
				.post(Entity.json(Poam.create("M2", "Teach a person how to fish", "Milestone")), Poam.class);
		assertThat(b.getId()).isNotNull();
		
		Poam c = httpQuery("/poams/new")
				.post(Entity.json(Poam.create("M3", "Watch the person fishing", "Milestone")), Poam.class);
		assertThat(c.getId()).isNotNull();
		
		Poam d = httpQuery("/poams/new")
				.post(Entity.json(Poam.create("M4", "Have the person go fishing without you", "Milestone")), Poam.class);
		assertThat(d.getId()).isNotNull();
		
			
		//TODO: Create an AO
		//TODO: Create POAMs
		//TODO: modify the POAMs
		//TODO: Assign the POAMs to the AO
	}
}
