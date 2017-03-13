package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.util.Duration;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.PersonStatus;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionStatus;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PersonList;
import mil.dds.anet.beans.search.ISearchQuery.SortOrder;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.beans.search.PersonSearchQuery.PersonSearchSortBy;
import mil.dds.anet.test.beans.OrganizationTest;

public class PersonResourceTest extends AbstractResourceTest {

	public PersonResourceTest() {
		if (client == null) {
			config.setConnectionTimeout(Duration.seconds(10));
			config.setTimeout(Duration.seconds(30));
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("person test client");
		}
	}

	@Test
	public void testCreatePerson() {
		final Person jack = getJackJackson();
		final Person admin = getArthurDmin();

		Person retPerson = httpQuery(String.format("/api/people/%d", jack.getId()), jack).get(Person.class);
		assertThat(retPerson).isEqualTo(jack);
		assertThat(retPerson.getId()).isEqualTo(jack.getId());

		Person newPerson = new Person();
		newPerson.setName("testCreatePerson Person");
		newPerson.setRole(Role.ADVISOR);
		newPerson.setStatus(PersonStatus.ACTIVE);
		newPerson.setBiography("Created buy the PersonResourceTest#testCreatePerson");
		newPerson.setGender("Female");
		newPerson.setCountry("Canada");
		newPerson.setEndOfTourDate(new DateTime(2020,4,1,0,0,0));
		newPerson = httpQuery("/api/people/new", admin).post(Entity.json(newPerson), Person.class);
		assertThat(newPerson.getId()).isNotNull();
		assertThat(newPerson.getName()).isEqualTo("testCreatePerson Person");

		newPerson.setName("testCreatePerson updated name");
		newPerson.setCountry("The Commonwealth of Canada");
		Response resp = httpQuery("/api/people/update", admin)
				.post(Entity.json(newPerson));
		assertThat(resp.getStatus()).isEqualTo(200);

		retPerson = httpQuery(String.format("/api/people/%d", newPerson.getId()), jack).get(Person.class);
		assertThat(retPerson.getName()).isEqualTo(newPerson.getName());
		
		//Test creating a person with a position already set. 
		OrganizationList orgs = httpQuery("/api/organizations/search?text=EF6&type=ADVISOR_ORG", jack).get(OrganizationList.class);
		assertThat(orgs.getList().size()).isGreaterThan(0);
		Organization org = orgs.getList().stream().filter(o -> o.getShortName().equalsIgnoreCase("EF6")).findFirst().get();

		Position newPos = new Position();
		newPos.setType(PositionType.ADVISOR);
		newPos.setName("Test Position");
		newPos.setOrganization(org);
		newPos.setStatus(PositionStatus.ACTIVE);
		newPos = httpQuery("/api/positions/new", admin).post(Entity.json(newPos), Position.class);
		assertThat(newPos.getId()).isNotNull();
		
		Person newPerson2 = new Person();
		newPerson2.setName("Namey McNameface");
		newPerson2.setRole(Role.ADVISOR);
		newPerson2.setDomainUsername("namey_" + DateTime.now().getMillis());
		newPerson2.setPosition(newPos);
		newPerson2 = httpQuery("/api/people/new", admin).post(Entity.json(newPerson2), Person.class);
		assertThat(newPerson2.getId()).isNotNull();
		
		retPerson = httpQuery("/api/people/" + newPerson2.getId(), admin).get(Person.class);
		assertThat(retPerson).isNotNull();
		assertThat(retPerson.loadPosition()).isNotNull();
		assertThat(retPerson.getPosition().getId()).isEqualTo(newPos.getId());
		
		//Change this person w/ a new position, and ensure it gets changed. 
		
		Position newPos2 = new Position();
		newPos2.setType(PositionType.ADVISOR);
		newPos2.setName("A Second Test Position");
		newPos2.setOrganization(org);
		newPos2.setStatus(PositionStatus.ACTIVE);
		newPos2 = httpQuery("/api/positions/new", admin).post(Entity.json(newPos2), Position.class);
		assertThat(newPos2.getId()).isNotNull();
		
		newPerson2.setName("Changey McChangeface");
		newPerson2.setPosition(newPos2);
		//A person cannot change their own position
		resp = httpQuery("/api/people/update", newPerson2).post(Entity.json(newPerson2));
		assertThat(resp.getStatus()).isEqualTo(javax.ws.rs.core.Response.Status.FORBIDDEN.getStatusCode());
		
		resp = httpQuery("/api/people/update", admin).post(Entity.json(newPerson2));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		retPerson = httpQuery("/api/people/" + newPerson2.getId(), admin).get(Person.class);
		assertThat(retPerson).isNotNull();
		assertThat(retPerson.getName()).isEqualTo(newPerson2.getName());
		assertThat(retPerson.loadPosition()).isNotNull();
		assertThat(retPerson.getPosition().getId()).isEqualTo(newPos2.getId());
		
		//Now newPerson2 who is a super user, should NOT be able to edit newPerson
		//Because they are not in newPerson2's organization. 
		resp = httpQuery("/api/people/update", newPerson2).post(Entity.json(newPerson));
		assertThat(resp.getStatus()).isEqualTo(javax.ws.rs.core.Response.Status.FORBIDDEN.getStatusCode());
		
	}

	@Test
	public void searchPerson() {
		Person jack = getJackJackson();

		PersonSearchQuery query = new PersonSearchQuery();
		query.setText("bob");

		PersonList searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		assertThat(searchResults.getTotalCount()).isGreaterThan(0);
		assertThat(searchResults.getList().stream().filter(p -> p.getName().equals("Bob Bobtown")).findFirst()).isNotEmpty();

		OrganizationList orgs = httpQuery("/api/organizations/search?text=EF1&type=ADVISOR_ORG", jack).get(OrganizationList.class);
		assertThat(orgs.getList().size()).isGreaterThan(0);
		Organization org = orgs.getList().stream().filter(o -> o.getShortName().equalsIgnoreCase("EF1.1")).findFirst().get();

		query.setText(null);
		query.setOrgId(org.getId());
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		assertThat(searchResults.getList()).isNotEmpty();

		//Search with children orgs
		org = orgs.getList().stream().filter(o -> o.getShortName().equalsIgnoreCase("EF1")).findFirst().get();
		query.setOrgId(org.getId());
		//First don't include child orgs and then increase the scope and verify results increase.
		final PersonList parentOnlyResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);

		query.setIncludeChildOrgs(true);
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		assertThat(searchResults.getList()).isNotEmpty();
		assertThat(searchResults.getList()).containsAll(parentOnlyResults.getList());

		query.setIncludeChildOrgs(true);
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		assertThat(searchResults.getList()).isNotEmpty();

		query.setOrgId(null);
		query.setText("advisor"); //Search against biographies
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		assertThat(searchResults.getList().size()).isGreaterThan(1);

		query.setText(null);
		query.setRole(Role.ADVISOR);
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		assertThat(searchResults.getList().size()).isGreaterThan(1);
		
		query.setRole(null);
		query.setText("e");
		query.setSortBy(PersonSearchSortBy.NAME);
		query.setSortOrder(SortOrder.DESC); 
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), PersonList.class);
		String prevName = null;
		for (Person p : searchResults.getList()) { 
			if (prevName != null) { assertThat(p.getName().compareToIgnoreCase(prevName)).isLessThanOrEqualTo(0); } 
			prevName = p.getName();
		}

	}
	
	@Test
	public void getAllPeopleTest() { 
		Person liz = getElizabethElizawell();
		
		PersonList results = httpQuery("/api/people/", liz).get(PersonList.class);
		assertThat(results.getTotalCount()).isGreaterThan(0);
		
		PersonList pageOne = httpQuery("/api/people?pageNum=0&pageSize=2", liz).get(PersonList.class);
		assertThat(pageOne.getTotalCount()).isEqualTo(results.getTotalCount());
		assertThat(pageOne.getList().size()).isEqualTo(2);
		assertThat(results.getList()).containsAll(pageOne.getList());
		
		PersonList pageTwo = httpQuery("/api/people?pageNum=1&pageSize=2", liz).get(PersonList.class);
		assertThat(pageTwo.getTotalCount()).isEqualTo(results.getTotalCount());
		assertThat(pageTwo.getList().size()).isEqualTo(2);
		assertThat(results.getList()).containsAll(pageTwo.getList());
		assertThat(pageOne.getList()).doesNotContainAnyElementsOf(pageTwo.getList());
		
	}
	
	@Test
	public void mergePeopleTest() { 
		final Person admin = getArthurDmin();

		//Create a person
		Person loser = new Person();
		loser.setRole(Role.ADVISOR);
		loser.setName("Loser for Merging");
		loser = httpQuery("/api/people/new", admin).post(Entity.json(loser), Person.class);
		
		//Create a Position
		Position test = new Position();
		test.setName("A Test Position created by mergePeopleTest");
		test.setType(PositionType.ADVISOR);
		test.setStatus(PositionStatus.ACTIVE);
		
		//Assign to an AO
		Organization ao = httpQuery("/api/organizations/new", admin)
				.post(Entity.json(OrganizationTest.getTestAO()), Organization.class);
		test.setOrganization(Organization.createWithId(ao.getId()));

		Position created = httpQuery("/api/positions/new", admin).post(Entity.json(test), Position.class);
		assertThat(created.getName()).isEqualTo(test.getName());
		
		//Assign the loser into the position
		Response resp = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).post(Entity.json(loser));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Create a second person
		Person winner = new Person();
		winner.setRole(Role.ADVISOR);
		winner.setName("Winner for Merging");
		winner = httpQuery("/api/people/new", admin).post(Entity.json(winner), Person.class);
		
		resp = httpQuery(String.format("/api/people/merge?winner=%d&loser=%d", winner.getId(), loser.getId()), admin).post(null);
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Assert that loser is gone. 
		resp = httpQuery("/api/people/" + loser.getId(), admin).get();
		assertThat(resp.getStatus()).isEqualTo(404);
		
		//Assert that the position is empty. 
		Person curr = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).get(Person.class);
		assertThat(curr).isNull();
		
		//Re-create loser and put into the position. 
		loser = new Person();
		loser.setRole(Role.ADVISOR);
		loser.setName("Loser for Merging");
		loser = httpQuery("/api/people/new", admin).post(Entity.json(loser), Person.class);
		resp = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).post(Entity.json(loser));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		resp = httpQuery(String.format("/api/people/merge?winner=%d&loser=%d&copyPosition=true", winner.getId(), loser.getId()), admin).post(null);
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Assert that loser is gone. 
		resp = httpQuery("/api/people/" + loser.getId(), admin).get();
		assertThat(resp.getStatus()).isEqualTo(404);
		
		//Assert that the winner is in the position. 
		curr = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).get(Person.class);
		assertThat(curr).isEqualTo(winner);
		
		
	}
}
