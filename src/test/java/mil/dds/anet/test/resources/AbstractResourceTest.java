package mil.dds.anet.test.resources;

import java.io.InputStream;
import java.util.Base64;
import java.util.List;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;
import org.junit.ClassRule;

import io.dropwizard.client.JerseyClientConfiguration;
import io.dropwizard.testing.junit.DropwizardAppRule;
import io.dropwizard.util.Duration;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.test.beans.PersonTest;

public abstract class AbstractResourceTest {

	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");
	
	public static Client client;
	public static JerseyClientConfiguration config = new JerseyClientConfiguration();
	static { 
		config.setConnectionTimeout(Duration.seconds(10));
	}
	
	public Builder httpQuery(String path) { 
		if (path.startsWith("/") == false ) { path = "/" + path; } 
		return client.target(String.format("http://localhost:%d%s", RULE.getLocalPort(), path))
			.request();
	}
	
	public Builder httpQuery(String path, Person authUser) { 
		String authString = Base64.getEncoder().encodeToString(
				(authUser.getFirstName() + ":" + authUser.getLastName()).getBytes());
		return httpQuery(path)
				.header("Authorization", "Basic " + authString);
	}
	
	public Person findOrPutPersonInDb(Person stub) { 
		List<Person> ret = httpQuery("/people/search?q=" + stub.getLastName(), PersonTest.getSteveStevesonStub()).get(new GenericType<List<Person>>() {});
		for (Person p : ret) { 
			if (p.getEmailAddress().equals(stub.getEmailAddress())) { return p; } 
		}
		
		//Create insert into DB, Steve Steveson should AWAYS be in the database. 
		Person newPerson = httpQuery("/people/new", PersonTest.getSteveStevesonStub()).post(Entity.json(stub), Person.class);
		return newPerson;
	}
	
	public Person getJackJackson() { 
		return findOrPutPersonInDb(PersonTest.getJackJacksonStub());
	}
	
	public Person getSteveSteveson() { 
		return findOrPutPersonInDb(PersonTest.getSteveStevesonStub());
	}
	
	public Person getRogerRogwell() { 
		return findOrPutPersonInDb(PersonTest.getRogerRogwell());
	}
	
	public Person getElizabethElizawell() { 
		return findOrPutPersonInDb(PersonTest.getElizabethElizawell());
	}
	
	public String getResponseBody(Response resp) {
		try { 
			InputStream is = (InputStream) resp.getEntity();
			return IOUtils.toString(is);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}
