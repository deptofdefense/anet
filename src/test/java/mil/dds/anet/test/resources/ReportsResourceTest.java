package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.Test;

import com.google.common.collect.Lists;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.PersonTest;

public class ReportsResourceTest extends AbstractResourceTest {

	public ReportsResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("reports test client");
		}
	}
	
	@Test
	public void createReport() {
		//Create a report writer
		Person author = httpQuery("/people/new").post(Entity.json(PersonTest.getJackJackson()), Person.class);
		
		//Create a principal for the report
		Person principal = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(PersonTest.getSteveSteveson()), Person.class);
		
		//Create an Advising Organization for the report writer
		AdvisorOrganization ao = client.target(String.format("http://localhost:%d/advisorOrganizations/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(AdvisorOrganizationTest.getTestAO()), AdvisorOrganization.class);
		//Add advisor into Advising Organization
		Response resp = httpQuery(String.format("/groups/%d/addMember?personId=%d", 
				ao.getMemberGroupId(), author.getId()))
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Create leadership people in the AO who can approve this report
		Person approver1 = new Person();
		approver1.setFirstName("Approver");
		approver1.setLastName("The first");
		approver1 = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(approver1), Person.class);
		
		//Create a billet for the author
		Billet authorBillet = new Billet();
		authorBillet.setName("A report writer");
		authorBillet.setAdvisorOrganization(ao);
		authorBillet = client.target(String.format("http://localhost:%d/billets/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(authorBillet), Billet.class);
		assertThat(authorBillet.getId()).isNotNull();
		//Set this author in this billet
		resp = client.target(String.format("http://localhost:%d/billets/%d/advisor", RULE.getLocalPort(), authorBillet.getId()))
				.request()
				.post(Entity.json(author));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Create Approval workflow for Advising Organization
		Group approvingGroup = client.target(String.format("http://localhost:%d/groups/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(Group.create("Test Group of approvers")), Group.class);
		resp = client.target(String.format("http://localhost:%d/groups/addMember?groupId=%d&personId=%d", RULE.getLocalPort(), approvingGroup.getId(), approver1.getId()))
				.request().get();
		ApprovalStep approval = client.target(String.format("http://localhost:%d/approvalSteps/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(ApprovalStep.create(null, approvingGroup.getId(), null, ao.getId())), ApprovalStep.class);
		
		//TODO: Create a POAM structure for the AO
//		fail("No way to assign a POAM to an AO");
		Poam top = client.target(String.format("http://localhost:%d/poams/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(Poam.create("test-1", "Test Top Poam", "TOP")), Poam.class);
		Poam action = client.target(String.format("http://localhost:%d/poams/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(Poam.create("test-1-1", "Test Poam Action", "Action", top)), Poam.class);
				
		
		//Create a Location that this Report was written at
		Location loc = client.target(String.format("http://localhost:%d/locations/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(Location.create("The Boat Dock", new LatLng(1.23,4.56))), Location.class);
		
		//Write a Report
		Report r = new Report();
		r.setAuthor(author);
		r.setPrincipals(Lists.newArrayList(principal));
		r.setPoams(Lists.newArrayList(action));
		r.setLocation(loc);
		r.setIntent("A testing report to test that reporting reports");
		r.setReportText("Report Text goes here, asdfjk");
		r.setNextSteps("This is the next steps on a report");
		Report created = client.target(String.format("http://localhost:%d/reports/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(r), Report.class);
		assertThat(created.getId()).isNotNull();
		assertThat(created.getState()).isEqualTo(ReportState.DRAFT);
		
		//Have the author submit the report
		resp = client.target(String.format("http://localhost:%d/reports/%d/submit", RULE.getLocalPort(), created.getId()))
			.request()
			.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Report returned = client.target(String.format("http://localhost:%d/reports/%d", RULE.getLocalPort(), created.getId()))
			.request()
			.get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
		assertThat(returned.getApprovalStepId()).isEqualTo(approval.getId());
		
		//TODO: Check on Report status for who needs to approve
		
		//Approve the report
		resp = client.target(String.format("http://localhost:%d/reports/%d/approve", RULE.getLocalPort(), created.getId()))
			.request()
			.get();
		
		//Check on Report status to verify it got moved forward
		returned = client.target(String.format("http://localhost:%d/reports/%d", RULE.getLocalPort(), created.getId()))
				.request()
				.get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.RELEASED);
		assertThat(returned.getApprovalStepId()).isNull();
		
		//Post a comment on the report because it's awesome
		
		
		//Search for this report by Author
		//Search for this report by Advisor
		//Search for this report by Location
		//Search for this report by Date
		//Search for this report by keyword
		//Search for this report by POAM (top level and bottom level)
		
	}
}
