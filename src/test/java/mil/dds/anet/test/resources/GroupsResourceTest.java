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
import mil.dds.anet.beans.Group;
import mil.dds.anet.config.AnetConfiguration;

public class GroupsResourceTest {

	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");
	
	public static Client client;
	
	public GroupsResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("groups test client");
		}
	}
	
	@Test
	public void createGroup() { 
		Group g = new Group();
		g.setName("A Test Group");
		
		Group created = client.target(String.format("http://localhost:%d/groups/new", RULE.getLocalPort()))
			.request()
			.post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		Group returned = client.target(String.format("http://localhost:%d/groups/%d", RULE.getLocalPort(), created.getId()))
			.request()
			.get(Group.class);
		assertThat(created).isEqualTo(returned);
		
		//TODO: Create a couple people and add them to the group
		//TODO: verify that users are in the group
		//TODO: remove a user from the group, verify they are no longer there
	}
	
	@Test
	public void changeGroup() { 
		Group g = new Group();
		g.setName("A Test-Change Group");
		
		Group created = client.target(String.format("http://localhost:%d/groups/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		created.setName("A Changed Name");
		Response resp = client.target(String.format("http://localhost:%d/groups/rename", RULE.getLocalPort()))
				.request()
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Group returned = client.target(String.format("http://localhost:%d/groups/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(Group.class);
		assertThat(created).isEqualTo(returned);
	}
	
	@Test
	public void deleteGroup() { 
		Group g = new Group();
		g.setName("A Group to Delete");
		
		//TODO: Implement. 
	}
}
