package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.ClassRule;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.testing.junit.DropwizardAppRule;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.test.beans.PersonTest;

public class PersonResourceTest {
	
	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");

	public static Client client;
	
	public PersonResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("test client");
		}
	}
	
	@Test
	public void testCreatePerson() {
        Person jack = PersonTest.getJackJackson();
        
        Person created = client.target(
                 String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
                .request()
                .post(Entity.json(jack), Person.class);
        assertThat(created.getFirstName()).isEqualTo(jack.getFirstName());
    	
    	Person retPerson = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), created.getId()))
    			.request()
    			.get(Person.class);
    	
    	assertThat(retPerson).isEqualTo(created);
    	assertThat(retPerson.getId()).isEqualTo(created.getId());
    	
    	created.setFirstName("Roberto");
    	Response resp = client.target(String.format("http://localhost:%d/person/update", RULE.getLocalPort()))
    			.request()
    			.post(Entity.json(created));
    	assertThat(resp.getStatus()).isEqualTo(200);
    	
    	retPerson = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), created.getId()))
    			.request()
    			.get(Person.class);
    	assertThat(retPerson.getFirstName()).isEqualTo(created.getFirstName());
    }
	
	//TODO: Assign Person to Advising Organiztion
	//TODO: Assign Person to Tashkil
	
	@Test
	public void testDeletePerson() { 
        Person jack = client.target(
                 String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
                .request()
                .post(Entity.json(PersonTest.getJackJackson()), Person.class);
        
        Response response = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), jack.getId()))
        	.request()
        	.delete();
        
        assertThat(response.getStatus()).isEqualTo(200);
        
        response = client.target(String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), jack.getId()))
        	.request().get();
        assertThat(response.getStatus()).isEqualTo(404);
       
	}
    
    
}
