package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.atIndex;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Test;

import com.google.common.collect.Lists;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.test.beans.OrganizationTest;

public class ApprovalStepResourceTest extends AbstractResourceTest {

	public ApprovalStepResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("approval step test client");
		}
	}
	
	@Test
	public void approvalTest() {
		Person jack = getJackJackson(); //Get an authenticated user. 
		//Create an Advisor Organization
		Organization org = httpQuery("api/organizations/new", jack)
				.post(Entity.json(OrganizationTest.getTestAO()), Organization.class);
		assertThat(org.getId()).isNotNull();
		
		//Create a group to do the approvals
		Group g = httpQuery("/api/groups/new", jack)
				.post(Entity.json(Group.create("Test Approval Group")), Group.class);
		assertThat(g.getId()).isNotNull();
		
		//Create 3 steps in order for this AO
		ApprovalStep as1 = httpQuery("/api/approvalSteps/new", jack)
				.post(Entity.json(ApprovalStep.create(null, g, null, org.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		
		ApprovalStep as2 = httpQuery("/api/approvalSteps/new", jack)
				.post(Entity.json(ApprovalStep.create(null, g, null, org.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		
		ApprovalStep as3 = httpQuery("/api/approvalSteps/new", jack)
				.post(Entity.json(ApprovalStep.create(null, g, null, org.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		
		as1.setNextStepId(as2.getId());
		as2.setNextStepId(as3.getId());
		List<ApprovalStep> asList = Lists.newArrayList(as1, as2, as3);
		Response resp = httpQuery("/api/approvalSteps/update", jack).post(Entity.json(asList));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Get them back in order
		List<ApprovalStep> returned = httpQuery(String.format("/approvalSteps/byOrganization?id=%d", org.getId()), jack)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(returned.size()).isEqualTo(3);
		System.out.println(as1);
		System.out.println(returned.get(0));
		assertThat(returned).contains(as1, atIndex(0));
		assertThat(returned).contains(as2, atIndex(1));
		assertThat(returned).contains(as3, atIndex(2));
		
		//Remove the first step
		resp = httpQuery(String.format("/approvalSteps/%d", as1.getId()), jack).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		returned = httpQuery(String.format("/approvalSteps/byOrganization?id=%d", org.getId()), jack)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(returned.size()).isEqualTo(2);
		assertThat(returned).contains(as2, atIndex(0));
		assertThat(returned).contains(as3, atIndex(1));
		
		//Create a new step and put in the middle
		ApprovalStep as4 = httpQuery("/api/approvalSteps/new", jack)
				.post(Entity.json(ApprovalStep.create(null, g, null, org.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		as2.setNextStepId(as4.getId());
		as4.setNextStepId(as3.getId());
		asList = Lists.newArrayList(as2, as3, as4);
		resp = httpQuery("/api/approvalSteps/update", jack).post(Entity.json(asList));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Get them back in order 2 -> 4 -> 3
		returned = httpQuery("/api/approvalSteps/byOrganization?id=" + org.getId(), jack)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(returned.size()).isEqualTo(3);
		assertThat(returned).contains(as2, atIndex(0));
		assertThat(returned).contains(as4, atIndex(1));
		assertThat(returned).contains(as3, atIndex(2));
		
	}
	
	//TODO: test that you cannot delete a step if a report is in that step. 
}
