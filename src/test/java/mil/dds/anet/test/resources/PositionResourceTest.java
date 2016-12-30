package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Collectors;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.util.Duration;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.test.beans.OrganizationTest;
import mil.dds.anet.test.beans.PositionTest;

public class PositionResourceTest extends AbstractResourceTest {

	public PositionResourceTest() { 
		if (client == null) { 
			config.setTimeout(Duration.seconds(30L));
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("positions test client");
		}
	}
	
	@Test
	public void positionTest() { 
		Person jack = getJackJackson();
		Person admin = getArthurDmin();
		assertThat(jack.getId()).isNotNull();
		
		//Create Position
		Position test = PositionTest.getTestPosition();
		
		//Assign to an AO
		Organization ao = httpQuery("/api/organizations/new", admin)
				.post(Entity.json(OrganizationTest.getTestAO()), Organization.class);
		test.setOrganization(Organization.createWithId(ao.getId()));

		Position created = httpQuery("/api/positions/new", admin).post(Entity.json(test), Position.class);
		assertThat(created.getName()).isEqualTo(test.getName());
		
		Position returned = httpQuery(String.format("/api/positions/%d",created.getId()), jack).get(Position.class);
		assertThat(returned.getOrganization().getId()).isEqualTo(ao.getId());
		
		//Assign a person into the position
		Response resp = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).post(Entity.json(jack));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person curr = httpQuery(String.format("/api/positions/%d/person",returned.getId()), admin).get(Person.class);
		assertThat(curr.getId()).isEqualTo(jack.getId());
		
		DateTime jacksTime = DateTime.now();
		try {
			Thread.sleep(500);//just slow me down a bit...
		} catch (InterruptedException e) {}  
		
		//change the person in this position
		Person steve = getSteveSteveson();
		resp = httpQuery(String.format("/api/positions/%d/person", returned.getId()), admin).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify that the new person is in the position
		curr = httpQuery(String.format("/api/positions/%d/person",returned.getId()), jack).get(Person.class);
		assertThat(curr.getId()).isEqualTo(steve.getId());
		
		//Verify that the previous person is now no longer in a position
		returned = httpQuery(String.format("/api/people/%d/position", jack.getId()), jack).get(Position.class);
		assertThat(returned).isEqualTo(null);		
		
		//delete the person from this position
		resp = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		curr = httpQuery(String.format("/api/positions/%d/person",created.getId()), jack).get(Person.class);
		assertThat(curr).isNull();
		
		//pull for the person at a previous time. 
		Person prev = httpQuery(String.format("/api/positions/%d/person?atTime=%d", created.getId(), jacksTime.getMillis()), jack)
				.get(Person.class);
		assertThat(prev).isNotNull();
		assertThat(prev.getId()).isEqualTo(jack.getId());
		
		//Create a principal
		List<Organization> orgs = httpQuery("/api/organizations/search?text=Ministry&type=PRINCIPAL_ORG", admin)
				.get(new GenericType<List<Organization>>() {});
		assertThat(orgs.size()).isGreaterThan(0);
			
		Position prinPos = new Position();
		prinPos.setName("A Principal Position created by PositionResourceTest");
		prinPos.setType(PositionType.PRINCIPAL);
		prinPos.setOrganization(orgs.get(0));
		
		Person principal = getRogerRogwell();
		assertThat(principal.getId()).isNotNull();
		Position t = httpQuery("/api/positions/new", admin).post(Entity.json(prinPos), Position.class);
		assertThat(t.getId()).isNotNull();
		
		//put the principal in a tashkil
		resp = httpQuery(String.format("/api/positions/%d/person", t.getId()), admin).post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//assign the tashkil to the position
		resp = httpQuery(String.format("/api/positions/%d/associated", created.getId()), admin).post(Entity.json(t));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that we can pull the tashkil from the position
		List<Position> retT = httpQuery(String.format("/api/positions/%d/associated", created.getId()), jack).get(new GenericType<List<Position>> () {});
		assertThat(retT.size()).isEqualTo(1);
		assertThat(retT).contains(t);
		
		//delete the tashkil from this position
		resp = httpQuery(String.format("/api/positions/%d/associated/%d", created.getId(), t.getId()), admin).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that it's now gone. 
		retT = httpQuery(String.format("/api/positions/%d/associated", created.getId()), jack).get(new GenericType<List<Position>>() {});
		assertThat(retT.size()).isEqualTo(0);
	}
	
	@Test
	public void tashkilTest() {
		Person jack = getJackJackson();
		Person admin = getArthurDmin();
		
		//Create Position
		Position t = PositionTest.getTestPosition();
		List<Organization> orgs = httpQuery("/api/organizations/search?q=Ministry&type=PRINCIPAL_ORG", admin)
			.get(new GenericType<List<Organization>>() {});
		assertThat(orgs.size()).isGreaterThan(0);
		
		t.setOrganization(orgs.get(0));
		
		Position created = httpQuery("/api/positions/new", admin).post(Entity.json(t), Position.class);
		assertThat(created.getName()).isEqualTo(t.getName());
		assertThat(created.getCode()).isEqualTo(t.getCode());
		assertThat(created.getId()).isNotNull();
		
		//Change Name/Code
		created.setName("Deputy Chief of Donuts");
		Response resp = httpQuery("/api/positions/update", admin).post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Position returned = httpQuery(String.format("/api/positions/%d",created.getId()), jack).get(Position.class);
		assertThat(returned.getName()).isEqualTo(created.getName());
		assertThat(returned.getCode()).isEqualTo(created.getCode());
		
		//Assign Principal
		Person principal = getSteveSteveson();
		
		resp = httpQuery(String.format("/api/positions/%d/person",created.getId()), admin).post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person returnedPrincipal = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).get(Person.class);
		assertThat(returnedPrincipal.getId()).isEqualTo(principal.getId());
		
		//TODO: Change the Principal
		
	}
	
	@Test
	public void searchTest() { 
		Person jack = getJackJackson();
		PositionSearchQuery query = new PositionSearchQuery();
		
		//Search by name
		query.setText("Advisor");
		List<Position> searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isNotEmpty();
		
		//Search by name & is not filled
		query.setIsFilled(false);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream().filter(p -> (p.getPersonJson() == null)).collect(Collectors.toList()))
			.hasSameElementsAs(searchResults);
		
		//Search by name and is filled and type
		query.setIsFilled(true);
		query.setType(PositionType.ADVISOR);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream()
				.filter(p -> (p.getPersonJson() != null))
				.filter(p -> p.getType().equals(PositionType.ADVISOR))
				.collect(Collectors.toList()))
			.hasSameElementsAs(searchResults);
		
		query.setType(PositionType.ADMINISTRATOR);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isEmpty();
		
		query.setText("Administrator");
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isNotEmpty();
		
		//Search by organization
		List<Organization> orgs = httpQuery("/api/organizations/search?type=ADVISOR_ORG&text=ef1", jack).get(new GenericType<List<Organization>>() {});
		assertThat(orgs.size()).isGreaterThan(0);
		Organization ef11 = orgs.stream().filter(o -> o.getName().equalsIgnoreCase("ef1.1")).findFirst().get();
		Organization ef1 = orgs.stream().filter(o -> o.getName().equalsIgnoreCase("ef1")).findFirst().get();
		assertThat(ef11.getName()).isEqualToIgnoringCase("EF1.1");
		assertThat(ef1.getName()).isEqualTo("EF1");
		
		query.setText("Advisor");
		query.setType(null);
		query.setOrganizationId(ef1.getId());
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isEmpty();
		
		query.setIncludeChildrenOrgs(true);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), new GenericType<List<Position>>() {});
		assertThat(searchResults).isNotEmpty();
		
		//Search by location
	}
	
}
