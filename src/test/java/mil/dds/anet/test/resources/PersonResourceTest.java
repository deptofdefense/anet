package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.util.Duration;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;
import mil.dds.anet.beans.search.PersonSearchQuery;

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
		Person admin = getArthurDmin();
		
		Person retPerson = httpQuery(String.format("/api/people/%d", jack.getId()), jack).get(Person.class); 	
    	assertThat(retPerson).isEqualTo(jack);
    	assertThat(retPerson.getId()).isEqualTo(jack.getId());
    	
    	Person newPerson = new Person();
    	newPerson.setName("testCreatePerson Person");
    	newPerson.setRole(Role.PRINCIPAL);
    	newPerson.setStatus(Status.ACTIVE);
    	newPerson.setBiography("Created buy the PersonResourceTest#testCreatePerson");
    	newPerson = httpQuery("/api/people/new", admin).post(Entity.json(newPerson), Person.class);
    	assertThat(newPerson.getId()).isNotNull();
    	assertThat(newPerson.getName()).isEqualTo("testCreatePerson Person");
    	
    	
    	newPerson.setName("testCreatePerson updated name");
    	Response resp = httpQuery("/api/people/update", admin)
    			.post(Entity.json(newPerson));
    	assertThat(resp.getStatus()).isEqualTo(200);
    	
    	retPerson = httpQuery(String.format("/api/people/%d", newPerson.getId()), jack).get(Person.class);
    	assertThat(retPerson.getName()).isEqualTo(newPerson.getName());
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
	public void searchPerson() { 
		Person jack = getJackJackson();
		
		PersonSearchQuery query = new PersonSearchQuery();
		query.setText("bob");
		
		List<Person> searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), new GenericType<List<Person>>() {});
		assertThat(searchResults.size()).isGreaterThan(0);
		assertThat(searchResults.stream().filter(p -> p.getName().equals("Bob Bobtown")).findFirst()).isNotEmpty();
		
		List<Organization> orgs = httpQuery("/api/organizations/search?q=EF1&type=ADVISOR_ORG", jack).get(new GenericType<List<Organization>>() {});
		assertThat(orgs.size()).isGreaterThan(0);
		Organization org = orgs.stream().filter(o -> o.getName().equalsIgnoreCase("EF1.1")).findFirst().get();
		
		query.setText(null);
		query.setOrgId(org.getId());
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), new GenericType<List<Person>>() {});
		assertThat(searchResults).isNotEmpty();
		
		query.setOrgId(null);
		query.setText("advisor"); //Search against biographies
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), new GenericType<List<Person>>() {});
		assertThat(searchResults.size()).isGreaterThan(1);
		
		query.setText(null);
		query.setRole(Role.ADVISOR);
		searchResults = httpQuery("/api/people/search", jack).post(Entity.json(query), new GenericType<List<Person>>() {});
		assertThat(searchResults.size()).isGreaterThan(1);
		
	}
}
