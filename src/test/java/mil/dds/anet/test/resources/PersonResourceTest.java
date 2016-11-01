package mil.dds.anet.test.resources;

import static io.dropwizard.testing.FixtureHelpers.fixture;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

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
import mil.dds.anet.beans.Person;

public class PersonResourceTest extends AbstractResourceTest {
		
	public PersonResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("person test client");
		}
	}

	@Test
	public void testCreatePerson() {
		Person jack = getJackJackson();
		//Creation is handled by the parent class, which really does a search... :D. 

		Person retPerson = httpQuery(String.format("/people/%d", jack.getId())).get(Person.class);
    	
    	assertThat(retPerson).isEqualTo(jack);
    	assertThat(retPerson.getId()).isEqualTo(jack.getId());
    	
    	jack.setFirstName("Roberto");
    	Response resp = httpQuery("/people/update")
    			.post(Entity.json(jack));
    	assertThat(resp.getStatus()).isEqualTo(200);
    	
    	retPerson = httpQuery(String.format("/people/%d", jack.getId())).get(Person.class);
    	assertThat(retPerson.getFirstName()).isEqualTo(jack.getFirstName());
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
		//Create some people
		final ObjectMapper MAPPER = Jackson.newObjectMapper();
		List<Person> people = new ArrayList<Person>();
		try { 
			List<Person> peopleStubs = MAPPER.readValue(fixture("testJson/people/fakeNames.json"), new TypeReference<List<Person>>() {});
			for (Person p : (peopleStubs.subList(0, 10))) { 
				Person created = httpQuery("/people/new").post(Entity.json(p), Person.class);
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
			String query = p.getFirstName().substring(0, 2 + (rand.nextInt(p.getFirstName().length() - 2)));
			List<Person> searchResults = client.target(String.format("http://localhost:%d/people/search?q=%s", RULE.getLocalPort(), query))
					.request()
					.get(new GenericType<List<Person>>() {});
			assertThat(searchResults.size()).isGreaterThan(0);
			assertThat(searchResults).contains(p);
		}
		
		for (int i=0;i<5;i++) { 
			Person p = people.get(rand.nextInt(people.size()));
			String query = p.getLastName().substring(0, 2 + (rand.nextInt(p.getLastName().length() - 2)));
			List<Person> searchResults = client.target(String.format("http://localhost:%d/people/search?q=%s", RULE.getLocalPort(), query))
					.request()
					.get(new GenericType<List<Person>>() {});
			assertThat(searchResults.size()).isGreaterThan(0);
			assertThat(searchResults).contains(p);
		}
	}
    
    
}
