package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.search.PoamSearchQuery;

public class PoamResourceTest extends AbstractResourceTest {

	public PoamResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("poam test client");
		}
	}
	
	@Test
	public void poamTest() { 
		Person jack = getJackJackson();
		Person admin = getArthurDmin();

		Poam a = httpQuery("/api/poams/new", admin)
			.post(Entity.json(Poam.create("TestF1", "Do a thing with a person", "Test-EF" )), Poam.class);
		assertThat(a.getId()).isNotNull();
				
		Poam b = httpQuery("/api/poams/new", admin)
				.post(Entity.json(Poam.create("TestM1", "Teach a person how to fish", "Test-Milestone", a, null)), Poam.class);
		assertThat(b.getId()).isNotNull();
		
		Poam c = httpQuery("/api/poams/new", admin)
				.post(Entity.json(Poam.create("TestM2", "Watch the person fishing", "Test-Milestone", a, null)), Poam.class);
		assertThat(c.getId()).isNotNull();
		
		Poam d = httpQuery("/api/poams/new", admin)
				.post(Entity.json(Poam.create("TestM3", "Have the person go fishing without you", "Test-Milestone", a, null)), Poam.class);
		assertThat(d.getId()).isNotNull();
		
		Poam e = httpQuery("/api/poams/new", admin)
				.post(Entity.json(Poam.create("TestF2", "Be a thing in a test case", "Test-EF", null, null)), Poam.class);
		assertThat(e.getId()).isNotNull();
		
		Poam returned = httpQuery("/api/poams/" + a.getId(), admin).get(Poam.class);
		assertThat(returned).isEqualTo(a);
		returned = httpQuery("/api/poams/" + b.getId(), admin).get(Poam.class);
		assertThat(returned).isEqualTo(b);		
		
		List<Poam> children = httpQuery("/api/poams/" + a.getId() + "/children", jack).get(new GenericType<List<Poam>>() {});
		assertThat(children).contains(b, c, d);
		assertThat(children).doesNotContain(e);
		
		List<Poam> tree = httpQuery("/api/poams/tree", jack).get(new GenericType<List<Poam>>() {});
		assertThat(tree).contains(a, e);
		assertThat(tree).doesNotContain(b);
		for (Poam p : tree) { 
			if (p.getId() == a.getId()) { 
				assertThat(p.getChildrenPoams()).contains(b, c, d);
			}
		}
		
		//modify a poam. 
		a.setLongName("Do a thing with a person modified");
		Response resp = httpQuery("/api/poams/update", admin).post(Entity.json(a));
		assertThat(resp.getStatus()).isEqualTo(200);
		returned = httpQuery("/api/poams/" + a.getId(), jack).get(Poam.class);
		assertThat(returned.getLongName()).isEqualTo(a.getLongName());

		//Assign the POAMs to the AO
		List<Organization> orgs = httpQuery("/api/organizations/search?text=EF8", jack).get(new GenericType<List<Organization>>() {});
		Organization ef8 = orgs.stream().filter(o -> o.getShortName().equals("EF8")).findFirst().get();
		assertThat(ef8).isNotNull();
		
		a.setResponsibleOrg(ef8);
		resp = httpQuery("/api/poams/update", admin).post(Entity.json(a));
		assertThat(resp.getStatus()).isEqualTo(200);
		returned = httpQuery("/api/poams/" + a.getId(), jack).get(Poam.class);
		assertThat(returned.getResponsibleOrg().getId()).isEqualTo(ef8.getId());
		
		//Fetch the poams off the organization
		List<Poam> poams = httpQuery("/api/organizations/" + ef8.getId() + "/poams", jack).get(new GenericType<List<Poam>>() {});
		assertThat(poams).contains(a);
		
		//Search for the poam: 
		
		
	}
	
	
	@Test
	public void searchTest() { 
		Person jack = getJackJackson();
		
		PoamSearchQuery query = new PoamSearchQuery();
		query.setText("Budget");
		List<Poam> searchResults = httpQuery("/api/poams/search", jack).post(Entity.json(query), new GenericType<List<Poam>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream()
				.filter(p -> p.getLongName().toLowerCase().contains("budget"))
				.count())
			.isEqualTo(searchResults.size());
		
		//Search for a poam by the organization
		List<Organization> orgs = httpQuery("/api/organizations/search?text=EF2", jack).get(new GenericType<List<Organization>>() {});
		Organization ef2 = orgs.stream().filter(o -> o.getShortName().equals("EF2")).findFirst().get();
		assertThat(ef2).isNotNull();
		
		query.setText(null);
		query.setResponsibleOrgId(ef2.getId());
		searchResults = httpQuery("/api/poams/search", jack).post(Entity.json(query), new GenericType<List<Poam>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream()
				.filter(p -> p.getResponsibleOrg().getId().equals(ef2.getId()))
				.count())
			.isEqualTo(searchResults.size());
		
		//Search by category
		query.setResponsibleOrgId(null);
		query.setText("expenses");
		query.setCategory("Milestone");
		searchResults = httpQuery("/api/poams/search", jack).post(Entity.json(query), new GenericType<List<Poam>>() {});
		assertThat(searchResults).isNotEmpty();
	}
}
