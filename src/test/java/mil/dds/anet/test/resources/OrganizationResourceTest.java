package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
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
		Person admin = getArthurDmin(); //get an authenticated user
		Person jack = getJackJackson();

		//Create a new AO
		Organization created = httpQuery("/api/organizations/new", admin)
			.post(Entity.json(ao), Organization.class);
		assertThat(ao.getShortName()).isEqualTo(created.getShortName());
		assertThat(ao.getLongName()).isEqualTo(created.getLongName());

		//update name of the AO
		created.setLongName("Ao McAoFace");
		Response resp = httpQuery("/api/organizations/update", admin)
				.post(Entity.json(created));
		assertThat(resp.getStatus()).isEqualTo(200);

		//Verify the AO name is updated.
		Organization updated = httpQuery(String.format("/api/organizations/%d",created.getId()), jack)
				.get(Organization.class);
		assertThat(updated.getLongName()).isEqualTo(created.getLongName());

		//Create a position and put then in this AO
		Position b1 = PositionTest.getTestPosition();
		b1.setOrganization(updated);
		b1 = httpQuery("/api/positions/new", admin).post(Entity.json(b1), Position.class);
		assertThat(b1.getId()).isNotNull();
		assertThat(b1.getOrganization().getId()).isEqualTo(updated.getId());

		b1.setOrganization(updated);
		resp = httpQuery("/api/positions/update", admin).post(Entity.json(b1));
		assertThat(resp.getStatus()).isEqualTo(200);

		Position ret = httpQuery(String.format("/api/positions/%d", b1.getId()), admin).get(Position.class);
		assertThat(ret.getOrganization()).isNotNull();
		assertThat(ret.getOrganization().getId()).isEqualTo(updated.getId());

		//Create a child organizations
		Organization child = new Organization();
		child.setParentOrg(Organization.createWithId(created.getId()));
		child.setShortName("AO McChild");
		child.setLongName("Child McAo");
		child.setType(OrganizationType.ADVISOR_ORG);
		child = httpQuery("/api/organizations/new", admin)
				.post(Entity.json(child), Organization.class);
		assertThat(child.getId()).isNotNull();

		OrganizationSearchQuery query = new OrganizationSearchQuery();
		query.setParentOrgId(created.getId());
		OrganizationList children = httpQuery(String.format("/api/organizations/search", created.getId()), admin)
			.post(Entity.json(query), OrganizationList.class);
		assertThat(children.getList()).hasSize(1).contains(child);
	}
	
	@Test
	public void searchTest() { 
		Person jack = getJackJackson();
		
		//Search by name
		OrganizationSearchQuery query = new OrganizationSearchQuery();
		query.setText("Ministry");
		List<Organization> results = httpQuery("/api/organizations/search", jack).post(Entity.json(query), OrganizationList.class).getList();
		assertThat(results).isNotEmpty();
		
		//Search by name and type
		query.setType(OrganizationType.ADVISOR_ORG);
		results = httpQuery("/api/organizations/search", jack).post(Entity.json(query), OrganizationList.class).getList();
		assertThat(results).isEmpty(); //Should be empty!
		
		query.setType(OrganizationType.PRINCIPAL_ORG);
		results = httpQuery("/api/organizations/search", jack).post(Entity.json(query), OrganizationList.class).getList();
		assertThat(results).isNotEmpty();
	}
}
