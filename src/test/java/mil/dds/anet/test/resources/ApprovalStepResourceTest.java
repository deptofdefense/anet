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
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;

public class ApprovalStepResourceTest extends AbstractResourceTest {

	public ApprovalStepResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("approval step test client");
		}
	}
	
	@Test
	public void approvalTest() {
		Person steve = getSteveSteveson(); //Get an authenticated user. 
		//Create an Advisor Organization
		AdvisorOrganization ao = httpQuery("/advisorOrganizations/new", steve)
				.post(Entity.json(AdvisorOrganizationTest.getTestAO()), AdvisorOrganization.class);
		assertThat(ao.getId()).isNotNull();
		
		//Create a group to do the approvals
		Group g = httpQuery("/groups/new", steve)
				.post(Entity.json(Group.create("Test Approval Group")), Group.class);
		assertThat(g.getId()).isNotNull();
		
		//Create 3 steps in order for this AO
		ApprovalStep as1 = httpQuery("/approvalSteps/new", steve)
				.post(Entity.json(ApprovalStep.create(null, g, null, ao.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		
		ApprovalStep as2 = httpQuery("/approvalSteps/new", steve)
				.post(Entity.json(ApprovalStep.create(null, g, null, ao.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		
		ApprovalStep as3 = httpQuery("/approvalSteps/new", steve)
				.post(Entity.json(ApprovalStep.create(null, g, null, ao.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		
		as1.setNextStepId(as2.getId());
		as2.setNextStepId(as3.getId());
		List<ApprovalStep> asList = Lists.newArrayList(as1, as2, as3);
		Response resp = httpQuery("/approvalSteps/update", steve).post(Entity.json(asList));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Get them back in order
		List<ApprovalStep> returned = httpQuery(String.format("/approvalSteps/byAdvisorOrganization?id=%d", ao.getId()), steve)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(returned.size()).isEqualTo(3);
		System.out.println(as1);
		System.out.println(returned.get(0));
		assertThat(returned).contains(as1, atIndex(0));
		assertThat(returned).contains(as2, atIndex(1));
		assertThat(returned).contains(as3, atIndex(2));
		
		//Remove the first step
		resp = httpQuery(String.format("/approvalSteps/%d", as1.getId()), steve).delete();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		returned = httpQuery(String.format("/approvalSteps/byAdvisorOrganization?id=%d", ao.getId()), steve)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(returned.size()).isEqualTo(2);
		assertThat(returned).contains(as2, atIndex(0));
		assertThat(returned).contains(as3, atIndex(1));
		
		//Create a new step and put in the middle
		ApprovalStep as4 = httpQuery("/approvalSteps/new", steve)
				.post(Entity.json(ApprovalStep.create(null, g, null, ao.getId())), ApprovalStep.class);
		assertThat(as1.getId()).isNotNull();
		as2.setNextStepId(as4.getId());
		as4.setNextStepId(as3.getId());
		asList = Lists.newArrayList(as2, as3, as4);
		resp = httpQuery("/approvalSteps/update", steve).post(Entity.json(asList));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Get them back in order 2 -> 4 -> 3
		returned = httpQuery("/approvalSteps/byAdvisorOrganization?id=" + ao.getId(), steve)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(returned.size()).isEqualTo(3);
		assertThat(returned).contains(as2, atIndex(0));
		assertThat(returned).contains(as4, atIndex(1));
		assertThat(returned).contains(as3, atIndex(2));
		
	}
	
	//TODO: test that you cannot delete a step if a report is in that step. 
}
