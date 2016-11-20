package mil.dds.anet.test.resources;

import static io.dropwizard.testing.FixtureHelpers.fixture;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.jackson.Jackson;
import io.dropwizard.util.Duration;
import mil.dds.anet.beans.Person;

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
		Person jack = getJackJackson();
		//Creation is handled by the parent class, which really does a search... :D. 

		Person retPerson = httpQuery(String.format("/people/%d", jack.getId()), jack).get(Person.class);
    	
    	assertThat(retPerson).isEqualTo(jack);
    	assertThat(retPerson.getId()).isEqualTo(jack.getId());
    	
    	jack.setName("Roberto Jackson");
    	Response resp = httpQuery("/people/update", retPerson)
    			.post(Entity.json(jack));
    	assertThat(resp.getStatus()).isEqualTo(200);
    	
    	retPerson = httpQuery(String.format("/people/%d", jack.getId()), jack).get(Person.class);
    	assertThat(retPerson.getName()).isEqualTo(jack.getName());
    }
	
//	@Test
//	public void testDeletePerson() { 
//        Person jack = client.target(
//                 String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
//                .request()
//                .post(Entity.json(PersonTest.getJackJackson()), Person.class);
//        
//        Response response = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), jack.getId()))
//        	.request()
//        	.delete();
//        
//        assertThat(response.getStatus()).isEqualTo(200);
//        
//        response = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), jack.getId()))
//        	.request().get();
//        assertThat(response.getStatus()).isEqualTo(404);
//       
//	}
	
	@Test
	public void testSearchPerson() { 
		Person steve = getSteveSteveson();
		//Create some people
		final ObjectMapper MAPPER = Jackson.newObjectMapper();
		List<Person> people = new ArrayList<Person>();
		try { 
			List<Person> peopleStubs = MAPPER.readValue(fixture("testJson/people/fakeNames.json"), new TypeReference<List<Person>>() {});
			for (Person p : (peopleStubs.subList(0, 10))) { 
				Person created = httpQuery("/people/new", steve).post(Entity.json(p), Person.class);
				people.add(created);
			}
		} catch (Exception e) { 
			e.printStackTrace();
			fail(e.getMessage());
		}
		
		//Search for some of them.
		Random rand = new Random();
		for (int i=0;i<5;i++) { 
			Person p = people.get(rand.nextInt(people.size()));
			String query = p.getName().substring(0, 2 + (rand.nextInt(p.getName().length() - 2)));
			List<Person> searchResults = httpQuery("/people/search?q=" + URLEncoder.encode(query), steve)
					.get(new GenericType<List<Person>>() {});
			assertThat(searchResults.size()).isGreaterThan(0);
			assertThat(searchResults).contains(p);
		}
	}
    
	@Test
	public void viewTest() { 
		Person steve = getSteveSteveson();
		Response resp = httpQuery("/people/", steve)
			.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/people/new", steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/people/1", steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/people/1/edit", steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
	}
	
}
