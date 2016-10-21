package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.ClassRule;
import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.testing.junit.DropwizardAppRule;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.config.AnetConfiguration;

public class LocationResourceTest {

	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");

	public static Client client;
	
	public LocationResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("test client");
		}
	}
	
	
	@Test
	public void locationTest() throws UnsupportedEncodingException { 
		Location l = Location.create("The Boat Dock", new LatLng(12.34,-56.78));
		
		Location created = client.target(String.format("http://localhost:%d/locations/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(l), Location.class);
		assertThat(created.getName()).isEqualTo(l.getName());
		assertThat(created).isNotEqualTo(l);
		
		//Search
		List<Location> results = client.target(String.format("http://localhost:%d/locations/search?name=%s", 
				RULE.getLocalPort(), URLEncoder.encode(l.getName(), "UTF-8")))
				.request()
				.get(new GenericType<List<Location>>() {});
		assertThat(results.size()).isGreaterThan(0);
		assertThat(results).contains(created);
		
		//Update
		created.setName("Down by the Bay");
		Response resp = client.target(String.format("http://localhost:%d/locations/update", RULE.getLocalPort()))
			.request()
			.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Location returned = client.target(String.format("http://localhost:%d/locations/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(Location.class);
		assertThat(returned.getName()).isEqualTo(created.getName());
	}
	
}
