package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import java.io.InputStream;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.ClassRule;
import org.junit.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.jackson.Jackson;
import io.dropwizard.testing.junit.DropwizardAppRule;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.test.beans.PersonTest;

public class PersonResourceTest {
	
	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");

	private static final ObjectMapper MAPPER = Jackson.newObjectMapper();
	
	public static Client client;
	
	public PersonResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("test client");
		}
	}
	
	@Test
	public void testCreatePerson() {
        Person jack = PersonTest.getJackJackson();
        
        Response response = client.target(
                 String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
                .request()
                .post(Entity.json(jack));
        
        assertThat(response.getStatus()).isEqualTo(200);
        
        Person createdPerson = null;
        try { 
        	createdPerson = MAPPER.readValue((InputStream) response.getEntity(), Person.class);        	
        } catch (Exception e) {
        	e.printStackTrace();
        	fail("Error deserializing Person from HTTP Request");
        }
    	assertThat(createdPerson.getFirstName()).isEqualTo(jack.getFirstName());
    	
    	Person retPerson = client.target(
    			String.format("http://localhost:%d/people/%d", RULE.getLocalPort(), createdPerson.getId()))
    			.request()
    			.get(Person.class);
    	
    	assertThat(retPerson).isEqualTo(createdPerson);
    	assertThat(retPerson.getId()).isEqualTo(createdPerson.getId());
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
