package mil.dds.anet.test.resources;

import java.io.InputStream;
import java.net.URLEncoder;
import java.util.Base64;
import java.util.List;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation.Builder;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.MediaType;
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
		config.setTimeout(Duration.seconds(30L));
		config.setConnectionTimeout(Duration.seconds(10));
	}
	
	public Builder httpQuery(String path) { 
		if (path.startsWith("/") == false ) { path = "/" + path; } 
		return client.target(String.format("http://localhost:%d%s", RULE.getLocalPort(), path))
			.request();
	}
	
	public Builder httpQuery(String path, Person authUser, MediaType acceptType) { 
		String authString = Base64.getEncoder().encodeToString(
				(authUser.getDomainUsername() + ":").getBytes());
		return httpQuery(path)
				.header("Authorization", "Basic " + authString)
				.header("Accept", acceptType.toString());
	}
	
	public Builder httpQuery(String path, Person authUser) { 
		return httpQuery(path, authUser, MediaType.APPLICATION_JSON_TYPE);
	}
	
	public Person findOrPutPersonInDb(Person stub) {
		List<Person> ret = httpQuery("/api/people/search?q=" + URLEncoder.encode(stub.getName()), PersonTest.getJackJacksonStub()).get(new GenericType<List<Person>>() {});
		for (Person p : ret) { 
			if (p.getEmailAddress().equals(stub.getEmailAddress())) { return p; } 
		}
		
		//Create insert into DB, Steve Steveson should AWAYS be in the database. 
		Person newPerson = httpQuery("/api/people/new", PersonTest.getArthurDmin()).post(Entity.json(stub), Person.class);
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
	
	public Person getNickNicholson() { 
		return findOrPutPersonInDb(PersonTest.getNickNicholson());
	}
	
	public Person getBobBobtown() { 
		return findOrPutPersonInDb(PersonTest.getBobBobtown());
	}
	
	public Person getArthurDmin() { 
		return findOrPutPersonInDb(PersonTest.getArthurDmin());
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
