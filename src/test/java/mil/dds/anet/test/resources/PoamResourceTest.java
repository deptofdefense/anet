package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;

public class PoamResourceTest extends AbstractResourceTest {

	public PoamResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("poam test client");
		}
	}
	
	@Test
	public void poamTest() { 
		Person steve = getSteveSteveson();
		
		Poam a = httpQuery("/poams/new", steve)
			.post(Entity.json(Poam.create("TestF1", "Do a thing with a person", "Test-EF")), Poam.class);
		assertThat(a.getId()).isNotNull();
				
		Poam b = httpQuery("/poams/new", steve)
				.post(Entity.json(Poam.create("TestM1", "Teach a person how to fish", "Test-Milestone", a)), Poam.class);
		assertThat(b.getId()).isNotNull();
		
		Poam c = httpQuery("/poams/new", steve)
				.post(Entity.json(Poam.create("TestM2", "Watch the person fishing", "Test-Milestone", a)), Poam.class);
		assertThat(c.getId()).isNotNull();
		
		Poam d = httpQuery("/poams/new", steve)
				.post(Entity.json(Poam.create("TestM3", "Have the person go fishing without you", "Test-Milestone", a)), Poam.class);
		assertThat(d.getId()).isNotNull();
		
		Poam e = httpQuery("/poams/new", steve)
				.post(Entity.json(Poam.create("TestF2", "Be a thing in a test case", "Test-EF")), Poam.class);
		assertThat(e.getId()).isNotNull();
		
		Poam returned = httpQuery("/poams/" + a.getId(), steve).get(Poam.class);
		assertThat(returned).isEqualTo(a);
		returned = httpQuery("/poams/" + b.getId(), steve).get(Poam.class);
		assertThat(returned).isEqualTo(b);		
		
		List<Poam> children = httpQuery("/poams/" + a.getId() + "/children", steve).get(new GenericType<List<Poam>>() {});
		assertThat(children).contains(b, c, d);
		assertThat(children).doesNotContain(e);
		
		List<Poam> tree = httpQuery("/poams/tree", steve).get(new GenericType<List<Poam>>() {});
		assertThat(tree).contains(a, e);
		assertThat(tree).doesNotContain(b);
		for (Poam p : tree) { 
			if (p.getId() == a.getId()) { 
				assertThat(p.getChildrenPoamsJson()).contains(b, c, d);
			}
		}
		
		//modify a poam. 
		a.setLongName("Do a thing with a person modified");
		Response resp = httpQuery("/poams/update", steve).post(Entity.json(a));
		assertThat(resp.getStatus()).isEqualTo(200);
		returned = httpQuery("/poams/" + a.getId(), steve).get(Poam.class);
		assertThat(returned.getLongName()).isEqualTo(a.getLongName());;

		
		//TODO: Assign the POAMs to the AO
	}
}
