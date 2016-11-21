package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.client.Entity;
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
		Person steve = getSteveSteveson();
		Person roger = getRogerRogwell();
		
		Group g = new Group();
		g.setName("A Test Group");
		
		Group created = httpQuery("/groups/new", steve).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		Group returned = httpQuery(String.format("/groups/%d", created.getId()), steve).get(Group.class);
		assertThat(created).isEqualTo(returned);
		
		//Create a couple people and add them to the group
		Person jack = getJackJackson();
		
		Response resp = httpQuery(String.format("/groups/%d/addMember?personId=%d", returned.getId(), jack.getId()), steve)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		resp = httpQuery(String.format("/groups/%d/addMember?personId=%d", returned.getId(), steve.getId()), steve).get();
		assertThat(resp.getStatus()).isEqualTo(200);
				
		//Verify that users are in the group
		returned = httpQuery(String.format("/groups/%d", created.getId()), steve)
				.get(Group.class);
		assertThat(returned.getMembers().size()).isEqualTo(2);
		assertThat(returned.getMembers()).contains(steve, jack);
		
		//Remove a user from the group, verify they are no longer there
		resp = httpQuery(String.format("/groups/%d/removeMember?personId=%d", returned.getId(), steve.getId()), steve).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		returned = httpQuery(String.format("/groups/%d", created.getId()), steve).get(Group.class);
		assertThat(returned.getMembers().size()).isEqualTo(1);
		assertThat(returned.getMembers()).doesNotContain(steve);
		
		g = new Group();
		g.setName("A Test Group with  members already");
		g.setMembers(Lists.newArrayList(steve, jack, roger));
		created = httpQuery("/groups/new", steve).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		returned = httpQuery(String.format("/groups/%d", created.getId()), steve)
				.get(Group.class);
		assertThat(returned.getMembers().size()).isEqualTo(3);
		assertThat(returned.getMembers()).contains(steve, jack, roger);
	}
	
	@Test
	public void changeGroup() { 
		Group g = new Group();
		g.setName("A Test-Change Group");
		
		Person steve = getSteveSteveson();
		
		Group created = httpQuery("/groups/new", steve).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		created.setName("A Changed Name");
		Response resp = httpQuery("/groups/rename", steve).post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Group returned = httpQuery(String.format("/groups/%d", created.getId()), steve)
				.get(Group.class);
		assertThat(created).isEqualTo(returned);
	}
	
	@Test
	public void deleteGroup() { 
		Group g = new Group();
		g.setName("A Group to Delete");
		Person steve = getSteveSteveson();
		
		Group created = httpQuery("/groups/new", steve).post(Entity.json(g), Group.class);
		assertThat(created.getName()).isEqualTo(g.getName());
		
		Response resp = httpQuery(String.format("/groups/%d", created.getId()), steve).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Group returned = httpQuery(String.format("/groups/%d", created.getId()), steve).get(Group.class);
		assertThat(returned).isNull();
	}
	
	@Test
	public void viewTest() { 
		Person steve = getSteveSteveson();
		Response resp = httpQuery("/groups/", steve)
			.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		String respBody = getResponseBody(resp);
		assertThat(respBody).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		Pattern groupIdPat = Pattern.compile("<a href=\"/groups/([0-9])+\">");
		Matcher groupIdMat = groupIdPat.matcher(respBody);
		assertThat(groupIdMat.find());
		int groupId = Integer.parseInt(groupIdMat.group(1));
		
		resp = httpQuery("/groups/new", steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/groups/" + groupId, steve)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		//TODO: build a group edit page?? 
//		resp = httpQuery("/groups/1/edit", steve)
//				.header("Accept", "text/html").get();
//		assertThat(resp.getStatus()).isEqualTo(200);
//		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
	}
}
