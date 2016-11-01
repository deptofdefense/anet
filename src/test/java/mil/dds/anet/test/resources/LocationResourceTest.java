package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;

public class LocationResourceTest extends AbstractResourceTest {

	public LocationResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("test client");
		}
	}
	
	
	@Test
	public void locationTest() throws UnsupportedEncodingException { 
		Location l = Location.create("The Boat Dock", new LatLng(12.34,-56.78));
		
		Location created = httpQuery("/locations/new")
				.post(Entity.json(l), Location.class);
		assertThat(created.getName()).isEqualTo(l.getName());
		assertThat(created).isNotEqualTo(l);
		
		//Search
		List<Location> results = httpQuery(String.format("/locations/search?q=%s", 
				URLEncoder.encode(l.getName(), "UTF-8")))
				.get(new GenericType<List<Location>>() {});
		assertThat(results.size()).isGreaterThan(0);
		assertThat(results).contains(created);
		
		//TODO: fuzzy searching
		
		//Update
		created.setName("Down by the Bay");
		Response resp = httpQuery("/locations/update").post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Location returned = httpQuery(String.format("/locations/%d", created.getId())).get(Location.class);
		assertThat(returned.getName()).isEqualTo(created.getName());
	}
	
}
