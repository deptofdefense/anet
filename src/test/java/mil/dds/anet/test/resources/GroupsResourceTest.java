package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import com.google.common.collect.Lists;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;

public class GroupsResourceTest extends AbstractResourceTest {

	public GroupsResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("groups test client");
		}
	}
	
	@Test
	public void createGroup() { 
		Person jack = getJackJackson();
		Person roger = getRogerRogwell();
		Person elizabeth = getElizabethElizawell();
		
		Group g = new Group();
		g.setName("A Test Group");
		
		Group created = httpQuery("/api/groups/new", jack).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		Group returned = httpQuery(String.format("/api/groups/%d", created.getId()), jack).get(Group.class);
		assertThat(created).isEqualTo(returned);
		
		//Create a couple people and add them to the group
		
		Response resp = httpQuery(String.format("/api/groups/%d/addMember?personId=%d", returned.getId(), jack.getId()), jack)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		resp = httpQuery(String.format("/api/groups/%d/addMember?personId=%d", returned.getId(), elizabeth.getId()), jack).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify that adding the same person to the group again fails
		resp = httpQuery(String.format("/api/groups/%d/addMember?personId=%d", returned.getId(), jack.getId()), jack)
				.get();
		assertThat(resp.getStatus()).isEqualTo(500);
		
		//Verify that users are in the group
		returned = httpQuery(String.format("/api/groups/%d", created.getId()), jack)
				.get(Group.class);
		assertThat(returned.getMembers().size()).isEqualTo(2);
		assertThat(returned.getMembers()).contains(elizabeth, jack);
		
		//Remove a user from the group, verify they are no longer there
		resp = httpQuery(String.format("/api/groups/%d/removeMember?personId=%d", returned.getId(), elizabeth.getId()), jack).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		returned = httpQuery(String.format("/api/groups/%d", created.getId()), jack).get(Group.class);
		assertThat(returned.getMembers().size()).isEqualTo(1);
		assertThat(returned.getMembers()).doesNotContain(elizabeth);
		
		g = new Group();
		g.setName("A Test Group with  members already");
		g.setMembers(Lists.newArrayList(elizabeth, jack, roger));
		created = httpQuery("/api/groups/new", jack).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		returned = httpQuery(String.format("/api/groups/%d", created.getId()), jack)
				.get(Group.class);
		assertThat(returned.getMembers().size()).isEqualTo(3);
		assertThat(returned.getMembers()).contains(elizabeth, jack, roger);
	}
	
	@Test
	public void changeGroup() { 
		Group g = new Group();
		g.setName("A Test-Change Group");
		
		Person jack = getJackJackson();
		
		Group created = httpQuery("/api/groups/new", jack).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		created.setName("A Changed Name");
		Response resp = httpQuery("/api/groups/rename", jack).post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Group returned = httpQuery(String.format("/api/groups/%d", created.getId()), jack)
				.get(Group.class);
		created.getCreatedAt();
		returned.getCreatedAt();
		assertThat(created).isEqualTo(returned);
	}
	
	@Test
	public void deleteGroup() { 
		Group g = new Group();
		g.setName("A Group to Delete");
		Person jack = getJackJackson();
		
		Group created = httpQuery("/api/groups/new", jack).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		Response resp = httpQuery(String.format("/api/groups/%d", created.getId()), jack).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Group returned = httpQuery(String.format("/api/groups/%d", created.getId()), jack).get(Group.class);
		assertThat(returned).isNull();
	}
}
