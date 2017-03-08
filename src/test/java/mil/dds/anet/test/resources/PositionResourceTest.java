package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.Collectors;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.util.Duration;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;
import mil.dds.anet.beans.PersonPositionHistory;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PositionList;
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
		Position test = new Position();
		test.setName("A Test Position created by PositionResourceTest");
		test.setType(PositionType.ADVISOR);
		
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
		
		final DateTime jacksTime = DateTime.now();
		try {
			Thread.sleep(500);//just slow me down a bit...
		} catch (InterruptedException ignore) {
			/* ignore */
		}  
		
		//change the person in this position
		Person steve = getSteveSteveson();
		final Position stevesCurrentPosition = steve.loadPosition();
		assertThat(stevesCurrentPosition).isNotNull();
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
		
		//Put steve back in his old position
		resp = httpQuery(String.format("/api/positions/%d/person", stevesCurrentPosition.getId()), admin).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		curr = httpQuery(String.format("/api/positions/%d/person",stevesCurrentPosition.getId()), jack).get(Person.class);
		assertThat(curr.getId()).isEqualTo(steve.getId());
		
		//pull for the person at a previous time. 
		Person prev = httpQuery(String.format("/api/positions/%d/person?atTime=%d", created.getId(), jacksTime.getMillis()), jack)
				.get(Person.class);
		assertThat(prev).isNotNull();
		assertThat(prev.getId()).isEqualTo(jack.getId());
		
		//Create a principal
		OrganizationList orgs = httpQuery("/api/organizations/search?text=Ministry&type=PRINCIPAL_ORG", admin)
				.get(OrganizationList.class);
		assertThat(orgs.getList().size()).isGreaterThan(0);
			
		Position prinPos = new Position();
		prinPos.setName("A Principal Position created by PositionResourceTest");
		prinPos.setType(PositionType.PRINCIPAL);
		prinPos.setOrganization(orgs.getList().get(0));
		
		Person principal = getRogerRogwell();
		assertThat(principal.getId()).isNotNull();
		Position tashkil = httpQuery("/api/positions/new", admin).post(Entity.json(prinPos), Position.class);
		assertThat(tashkil.getId()).isNotNull();
		
		//put the principal in a tashkil
		resp = httpQuery(String.format("/api/positions/%d/person", tashkil.getId()), admin).post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//assign the tashkil to the position
		resp = httpQuery(String.format("/api/positions/%d/associated", created.getId()), admin).post(Entity.json(tashkil));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that we can pull the tashkil from the position
		PositionList retT = httpQuery(String.format("/api/positions/%d/associated", created.getId()), jack).get(PositionList.class);
		assertThat(retT.getList().size()).isEqualTo(1);
		assertThat(retT.getList()).contains(tashkil);
		
		//delete the tashkil from this position
		resp = httpQuery(String.format("/api/positions/%d/associated/%d", created.getId(), tashkil.getId()), admin).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that it's now gone. 
		retT = httpQuery(String.format("/api/positions/%d/associated", created.getId()), jack).get(PositionList.class);
		assertThat(retT.getList().size()).isEqualTo(0);
	}
	
	@Test
	public void tashkilTest() {
		final Person jack = getJackJackson();
		final Person admin = getArthurDmin();
		
		//Create Position
		Position test = PositionTest.getTestPosition();
		OrganizationList orgs = httpQuery("/api/organizations/search?text=Ministry&type=PRINCIPAL_ORG", admin)
			.get(OrganizationList.class);
		assertThat(orgs.getList().size()).isGreaterThan(0);
		
		test.setOrganization(orgs.getList().get(0));
		
		Position created = httpQuery("/api/positions/new", admin).post(Entity.json(test), Position.class);
		assertThat(created.getName()).isEqualTo(test.getName());
		assertThat(created.getCode()).isEqualTo(test.getCode());
		assertThat(created.getId()).isNotNull();
		
		//Change Name/Code
		created.setName("Deputy Chief of Donuts");
		Response resp = httpQuery("/api/positions/update", admin).post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Position returned = httpQuery(String.format("/api/positions/%d",created.getId()), jack).get(Position.class);
		assertThat(returned.getName()).isEqualTo(created.getName());
		assertThat(returned.getCode()).isEqualTo(created.getCode());
		
		//Assign Principal
		Person steve = getSteveSteveson();
		Position stevesCurrPos = steve.loadPosition();
		assertThat(stevesCurrPos).isNotNull();
		
		resp = httpQuery(String.format("/api/positions/%d/person",created.getId()), admin).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person returnedPrincipal = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).get(Person.class);
		assertThat(returnedPrincipal.getId()).isEqualTo(steve.getId());
		
		//Put steve back in his originial position
		resp = httpQuery(String.format("/api/positions/%d/person",stevesCurrPos.getId()), admin).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Ensure the old position is now empty
		returnedPrincipal = httpQuery(String.format("/api/positions/%d/person", created.getId()), admin).get(Person.class);
		assertThat(returnedPrincipal).isNull();
		
		
		
	}
	
	@Test
	public void searchTest() { 
		Person jack = getJackJackson();
		PositionSearchQuery query = new PositionSearchQuery();
		
		//Search by name
		query.setText("Advisor");
		List<Position> searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isNotEmpty();
		
		//Search by name & is not filled
		query.setIsFilled(false);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream().filter(p -> (p.getPerson() == null)).collect(Collectors.toList()))
			.hasSameElementsAs(searchResults);
		
		//Search by name and is filled and type
		query.setIsFilled(true);
		query.setType(PositionType.ADVISOR);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream()
				.filter(p -> (p.getPerson() != null))
				.filter(p -> p.getType().equals(PositionType.ADVISOR))
				.collect(Collectors.toList()))
			.hasSameElementsAs(searchResults);
		
		query.setType(PositionType.ADMINISTRATOR);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isEmpty();
		
		query.setText("Administrator");
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isNotEmpty();
		
		//Search by organization
		List<Organization> orgs = httpQuery("/api/organizations/search?type=ADVISOR_ORG&text=ef1", jack).get(OrganizationList.class).getList();
		assertThat(orgs.size()).isGreaterThan(0);
		Organization ef11 = orgs.stream().filter(o -> o.getShortName().equalsIgnoreCase("ef1.1")).findFirst().get();
		Organization ef1 = orgs.stream().filter(o -> o.getShortName().equalsIgnoreCase("ef1")).findFirst().get();
		assertThat(ef11.getShortName()).isEqualToIgnoringCase("EF1.1");
		assertThat(ef1.getShortName()).isEqualTo("EF1");
		
		query.setText("Advisor");
		query.setType(null);
		query.setOrganizationId(ef1.getId());
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isEmpty();
		
		query.setIncludeChildrenOrgs(true);
		searchResults = httpQuery("/api/positions/search", jack).post(Entity.json(query), PositionList.class).getList();
		assertThat(searchResults).isNotEmpty();
		
		//Search by location
	}
	
	@Test
	public void getAllPositionsTest() { 
		Person jack = getJackJackson();
		
		int pageNum = 0;
		int pageSize = 10;
		int totalReturned = 0;
		int firstTotalCount = 0;
		PositionList list = null;
		do { 
			list = httpQuery("/api/positions/?pageNum=" + pageNum + "&pageSize=" + pageSize, jack).get(PositionList.class);
			assertThat(list).isNotNull();
			assertThat(list.getPageNum()).isEqualTo(pageNum);
			assertThat(list.getPageSize()).isEqualTo(pageSize);
			totalReturned += list.getList().size();
			if (pageNum == 0) { firstTotalCount = list.getTotalCount(); }
			pageNum++;
		} while (list.getList().size() != 0); 
		
		assertThat(totalReturned).isEqualTo(firstTotalCount);
	}
	
	@Test
	public void createPositionTest() {
		Person authur = getArthurDmin();
		
		//Create a new position and designate the person upfront
		Person newb = new Person();
		newb.setName("PositionTest Person");
		newb.setRole(Role.PRINCIPAL);
		newb.setStatus(Status.ACTIVE);
		
		newb = httpQuery("/api/people/new", authur).post(Entity.json(newb), Person.class);
		assertThat(newb.getId()).isNotNull();
		
		OrganizationList orgs = httpQuery("/api/organizations/search?text=Ministry&type=PRINCIPAL_ORG", authur)
				.get(OrganizationList.class);
		assertThat(orgs.getList().size()).isGreaterThan(0);
		
		Position newbPosition = new Position();
		newbPosition.setName("PositionTest Position for Newb");
		newbPosition.setType(PositionType.PRINCIPAL);
		newbPosition.setOrganization(orgs.getList().get(0));
		newbPosition.setPerson(newb);
		
		newbPosition = httpQuery("/api/positions/new", authur).post(Entity.json(newbPosition), Position.class);
		assertThat(newbPosition.getId()).isNotNull();
		
		//Ensure that the position contains the person
		Position returned = httpQuery("/api/positions/" + newbPosition.getId(), authur).get(Position.class);
		assertThat(returned.getId()).isNotNull();
		assertThat(returned.loadPerson()).isNotNull();
		assertThat(returned.loadPerson().getId()).isEqualTo(newb.getId());
		
		//Ensure that the person is assigned to this position. 
		assertThat(newb.loadPosition()).isNotNull();
		assertThat(newb.loadPosition().getId()).isEqualTo(returned.getId());
		
		//Assign somebody else to this position. 
		Person prin2 = new Person();
		prin2.setName("2nd Principal in PrincipalTest");
		prin2.setRole(Role.PRINCIPAL);
		prin2 = httpQuery("/api/people/new", authur).post(Entity.json(prin2),Person.class);
		assertThat(prin2.getId()).isNotNull();
		assertThat(prin2.loadPosition()).isNull();
		
		prin2.setPosition(Position.createWithId(newbPosition.getId()));
		Response resp = httpQuery("/api/people/update", authur).post(Entity.json(prin2));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Reload this person to check their position was set. 
		prin2 = httpQuery("/api/people/" + prin2.getId(), authur).get(Person.class);
		assertThat(prin2).isNotNull();
		assertThat(prin2.loadPosition()).isNotNull();
		assertThat(prin2.loadPosition().getId()).isEqualTo(newbPosition.getId());
		
		//Check with a different API endpoint. 
		Person currHolder = httpQuery("/api/positions/" + newbPosition.getId() + "/person", authur).get(Person.class);
		assertThat(currHolder).isNotNull();
		assertThat(currHolder.getId()).isEqualTo(prin2.getId());
		
		//Slow the test down a bit
		try {
			Thread.sleep(10);
		} catch (InterruptedException ignore) { }
		
		//Create a new position and move prin2 there on CREATE. 
		Position pos2 = new Position();
		pos2.setName("Created by PositionTest");
		pos2.setType(PositionType.PRINCIPAL);
		pos2.setOrganization(orgs.getList().get(0));
		pos2.setPerson(Person.createWithId(prin2.getId()));
		
		pos2 = httpQuery("/api/positions/new", authur).post(Entity.json(pos2), Position.class);
		assertThat(pos2.getId()).isNotNull();
		
		returned = httpQuery("/api/positions/" + pos2.getId(), authur).get(Position.class);
		assertThat(returned).isNotNull();
		assertThat(returned.getName()).isEqualTo(pos2.getName());
		assertThat(returned.loadPerson()).isNotNull();
		assertThat(returned.loadPerson().getId()).isEqualTo(prin2.getId());
		
		//Make sure prin2 got moved out of newbPosition
		currHolder = httpQuery("/api/positions/" + newbPosition.getId() + "/person", authur).get(Person.class);
		assertThat(currHolder).isNull();
		
		//Pull the history of newbPosition
		newbPosition = httpQuery("/api/positions/" + newbPosition.getId(), authur).get(Position.class);
		List<PersonPositionHistory> history = newbPosition.loadPreviousPeople();
		assertThat(history.size()).isEqualTo(2);
		assertThat(history.get(0).getPerson().getId()).isEqualTo(newb.getId());
		assertThat(history.get(1).getPerson().getId()).isEqualTo(prin2.getId());
		
		
		
	}
	
}
