package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
		assertThat(jack.getId()).isNotNull();
		
		//Create Position
		Position test = PositionTest.getTestPosition();
		
		Position created = httpQuery("/positions/new", jack).post(Entity.json(test), Position.class);
		assertThat(created.getName()).isEqualTo(test.getName());
		
		//Assign to an AO
		Organization ao = httpQuery("/organizations/new", jack)
				.post(Entity.json(OrganizationTest.getTestAO()), Organization.class);
		created.setOrganization(Organization.createWithId(ao.getId()));
		
		Response resp = httpQuery("/positions/update", jack).post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Position returned = httpQuery(String.format("/positions/%d",created.getId()), jack).get(Position.class);
		assertThat(returned.getOrganization().getId()).isEqualTo(ao.getId());
		
		//Assign a person into the position
		resp = httpQuery(String.format("/positions/%d/person", created.getId()), jack).post(Entity.json(jack));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person curr = httpQuery(String.format("/positions/%d/person",returned.getId()), jack).get(Person.class);
		assertThat(curr.getId()).isEqualTo(jack.getId());
		
		DateTime jacksTime = DateTime.now();
		try {
			Thread.sleep(500);//just slow me down a bit...
		} catch (InterruptedException e) {}  
		
		//change the person in this position
		Person steve = getSteveSteveson();
		resp = httpQuery(String.format("/positions/%d/person", returned.getId()), jack).post(Entity.json(steve));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify that the new person is in the position
		curr = httpQuery(String.format("/positions/%d/person",returned.getId()), jack).get(Person.class);
		assertThat(curr.getId()).isEqualTo(steve.getId());
		
		//Verify that the previous person is now no longer in a position
		returned = httpQuery(String.format("/people/%d/position", jack.getId()), jack).get(Position.class);
		assertThat(returned).isEqualTo(null);		
		
		//delete the person from this position
		resp = httpQuery(String.format("/positions/%d/person", created.getId()), jack).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		curr = httpQuery(String.format("/positions/%d/person",created.getId()), jack).get(Person.class);
		assertThat(curr).isNull();
		
		//pull for the person at a previous time. 
		Person prev = httpQuery(String.format("/positions/%d/person?atTime=%d", created.getId(), jacksTime.getMillis()), jack)
				.get(Person.class);
		assertThat(prev).isNotNull();
		assertThat(prev.getId()).isEqualTo(jack.getId());
		
		//Create a principal
		Person principal = getRogerRogwell();
		assertThat(principal.getId()).isNotNull();
		Position t = httpQuery("/positions/new", jack).post(Entity.json(PositionTest.getTestPosition()), Position.class);
		assertThat(t.getId()).isNotNull();
		
		//put the principal in a tashkil
		resp = httpQuery(String.format("/positions/%d/person", t.getId()), jack).post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//assign the tashkil to the position
		resp = httpQuery(String.format("/positions/%d/associated", created.getId()), jack).post(Entity.json(t));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that we can pull the tashkil from the position
		List<Position> retT = httpQuery(String.format("/positions/%d/associated", created.getId()), jack).get(new GenericType<List<Position>> () {});
		assertThat(retT.size()).isEqualTo(1);
		assertThat(retT).contains(t);
		
		//delete the tashkil from this position
		resp = httpQuery(String.format("/positions/%d/associated/%d", created.getId(), t.getId()), jack).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//verify that it's now gone. 
		retT = httpQuery(String.format("/positions/%d/associated", created.getId()), jack).get(new GenericType<List<Position>>() {});
		assertThat(retT.size()).isEqualTo(0);
	}
	
	@Test
	public void viewTest() { 
		Person steve = getSteveSteveson();
		Response resp = httpQuery("/positions/", steve)
			.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		String respBody = getResponseBody(resp);
		assertThat(respBody).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		Pattern positionIdPat = Pattern.compile("<a href=\"/positions/([0-9]+)\">");
		Matcher positionIdMat = positionIdPat.matcher(respBody);
		assertThat(positionIdMat.find());
		int positionId = Integer.parseInt(positionIdMat.group(1));
		
		resp = httpQuery("/positions/new", steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/positions/" + positionId, steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/positions/" + positionId + "/edit", steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
	}
	
	@Test
	public void tashkilTest() { 
		//Create Position
		Position t = PositionTest.getTestPosition();
		Person steve = getSteveSteveson();
		
		Position created = httpQuery("/positions/new", steve).post(Entity.json(t), Position.class);
		assertThat(created.getName()).isEqualTo(t.getName());
		assertThat(created.getCode()).isEqualTo(t.getCode());
		assertThat(created.getId()).isNotNull();
		
		//Change Name/Code
		created.setName("Deputy Chief of Donuts");
		Response resp = httpQuery("/positions/update", steve).post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Position returned = httpQuery(String.format("/positions/%d",created.getId()), steve).get(Position.class);
		assertThat(returned.getName()).isEqualTo(created.getName());
		assertThat(returned.getCode()).isEqualTo(created.getCode());
		
		//Assign Principal
		Person principal = getJackJackson();
		
		resp = httpQuery(String.format("/positions/%d/person",created.getId()), steve).post(Entity.json(principal));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Person returnedPrincipal = httpQuery(String.format("/positions/%d/person", created.getId()), steve).get(Person.class);
		assertThat(returnedPrincipal.getId()).isEqualTo(principal.getId());
		
		//TODO: Change the Principal
		
	}
	
}
