package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
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
		Person jack = getJackJackson(); //get an authenticated user 
		
		//Create a new AO
		Organization created = httpQuery("/organizations/new", jack)
			.post(Entity.json(ao), Organization.class);
		assertThat(ao.getName()).isEqualTo(created.getName());
		
		//update name of the AO
		created.setName("Ao McAoFace");
		Response resp = httpQuery("/organizations/update", jack)
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Verify the AO name is updated. 
		Organization updated = httpQuery(String.format("/organizations/%d",created.getId()), jack)
				.get(Organization.class);
		assertThat(updated.getName()).isEqualTo(created.getName());
		
		//Create a position and put then in this AO
		Position b1 = httpQuery("/positions/new", jack).post(Entity.json(PositionTest.getTestPosition()), Position.class);
		assertThat(b1.getId()).isNotNull();
		assertThat(b1.getOrganization()).isNull();
		
		b1.setOrganization(updated);
		resp = httpQuery("/positions/update", jack).post(Entity.json(b1));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Position ret = httpQuery(String.format("/positions/%d", b1.getId()), jack).get(Position.class);
		assertThat(ret.getOrganization()).isNotNull();
		assertThat(ret.getOrganization().getId()).isEqualTo(updated.getId());
				
		//Create a child organizations
		Organization child = new Organization();
		child.setParentOrg(Organization.createWithId(created.getId()));
		child.setName("Child McAo");
		child.setType(OrganizationType.ADVISOR_ORG);
		child = httpQuery("/organizations/new", jack)
				.post(Entity.json(child), Organization.class);
		assertThat(child.getId()).isNotNull();
		
		List<Organization> children = httpQuery(String.format("/organizations/%d/children", created.getId()), jack)
			.get(new GenericType<List<Organization>>() {});
		assertThat(children).hasSize(1).contains(child);
	}
	
	
	@Test
	public void viewTest() { 
		Person jack = getJackJackson();
		Response resp = httpQuery("/organizations/", jack)
			.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		String respBody = getResponseBody(resp);
		assertThat(respBody).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		Pattern idPat = Pattern.compile("href=\"/organizations/([0-9]+)\"");
		Matcher idMat = idPat.matcher(respBody);
		assertThat(idMat.find());
		int orgId = Integer.parseInt(idMat.group(1));
		
		resp = httpQuery("/organizations/new", jack)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/organizations/" + orgId, jack)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/organizations/" + orgId + "/edit", jack)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
	}
}
