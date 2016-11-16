package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Person;
import mil.dds.anet.test.beans.OrganizationTest;
import mil.dds.anet.test.beans.PositionTest;

public class OrganizationResourceTest extends AbstractResourceTest {

	public OrganizationResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("ao test client");
		}
	}
	
	@Test
	public void createAO() { 
		Organization ao = OrganizationTest.getTestAO();
		Person steve = getSteveSteveson(); //get an authenticated user 
		
		//Create a new AO
		Organization created = httpQuery("/organizations/new", steve)
			.post(Entity.json(ao), Organization.class);
		assertThat(ao.getName()).isEqualTo(created.getName());
		
		//update name of the AO
		created.setName("Ao McAoFace");
		Response resp = httpQuery("/organizations/update", steve)
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify the AO name is updated. 
		Organization updated = httpQuery(String.format("/organizations/%d",created.getId()), steve)
				.get(Organization.class);
		assertThat(updated.getName()).isEqualTo(created.getName());
		
		//Create a position and put then in this AO
		Position b1 = httpQuery("/positions/new", steve).post(Entity.json(PositionTest.getTestPosition()), Position.class);
		assertThat(b1.getId()).isNotNull();
		assertThat(b1.getOrganization()).isNull();
		
		b1.setOrganization(updated);
		resp = httpQuery("/positions/update", steve).post(Entity.json(b1));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Position ret = httpQuery(String.format("/positions/%d", b1.getId()), steve).get(Position.class);
		assertThat(ret.getOrganization()).isNotNull();
		assertThat(ret.getOrganization().getId()).isEqualTo(updated.getId());
				
		
	}
	
}
