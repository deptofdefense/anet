package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.junit.ClassRule;
import org.junit.Test;

import com.google.common.collect.Lists;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.testing.junit.DropwizardAppRule;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.PersonTest;

public class ReportsResourceTest {

	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");
	
	public static Client client;
	
	public ReportsResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).build("reports test client");
		}
	}
	
	@Test
	public void createReport() {
		
		//Create a report writer
		Person author = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(PersonTest.getJackJackson()), Person.class);
		
		//Create a principal for the report
		Person principal = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(PersonTest.getSteveSteveson()), Person.class);
		
		//Create an Advising Organization for the report writer
		AdvisorOrganization ao = client.target(String.format("http://localhost:%d/advisorOrganizations/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(AdvisorOrganizationTest.getTestAO()), AdvisorOrganization.class);
		//Add advisor into Advising Organization
		Response resp = client.target(String.format("http://localhost:%d/groups/addMember?groupId=%d&personId=%d", 
				RULE.getLocalPort(), ao.getMemberGroupId(), author.getId()))
				.request()
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Create leadership people in the AO who can approve this report
		Person approver1 = new Person();
		approver1.setFirstName("Approver");
		approver1.setLastName("The first");
		approver1 = client.target(String.format("http://localhost:%d/people/new", RULE.getLocalPort()))
				.request()
				.post(Entity.json(approver1), Person.class);
		//Create Approval workflow for Advising Organization
		fail("Implement me!");
		
		//Create a POAM structure for the AO
		fail("No way to assign a POAM to an AO");
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
		
		
		//Check on Report status for who needs to approve	
		//Approve the report
		//Check on Report status to verify it got moved forward
		
		//Post a comment on the report because it's awesome
		
		
		//Search for this report by Author
		//Search for this report by Advisor
		//Search for this report by Location
		//Search for this report by Date
		//Search for this report by keyword
		//Search for this report by POAM (top level and bottom level)
		
	}
}
