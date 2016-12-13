package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.joda.time.DateTime;
import org.junit.Test;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

import io.dropwizard.client.JerseyClientBuilder;
import io.dropwizard.util.Duration;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.Atmosphere;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.test.beans.CommentTest;
import mil.dds.anet.test.beans.OrganizationTest;
import mil.dds.anet.test.beans.PersonTest;

public class ReportsResourceTest extends AbstractResourceTest {

	public ReportsResourceTest() { 
		if (client == null) { 
			config.setConnectionRequestTimeout(Duration.seconds(30L));
			config.setConnectionTimeout(Duration.seconds(30L));
			config.setTimeout(Duration.seconds(30L));
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("reports test client");
		}
	}
	
	@Test
	public void createReport() {
		//Create a report writer
		Person author = getJackJackson();
		
		//Create a principal for the report
		ReportPerson principal = PersonTest.personToReportPerson(getSteveSteveson());
		principal.setPrimary(true);
		
		//Create an Advising Organization for the report writer
		Organization org = httpQuery("/organizations/new", author)
				.post(Entity.json(OrganizationTest.getTestAO()), Organization.class);
		
		//Create leadership people in the AO who can approve this report
		Person approver1 = new Person();
		approver1.setDomainUsername("bob");
		approver1.setName("Bob Bobtown");
		approver1.setEmailAddress("bob@example.com");
		approver1 = findOrPutPersonInDb(approver1);
		Person approver2 = getElizabethElizawell();
		
		//Create a billet for the author
		Position authorBillet = new Position();
		authorBillet.setName("A report writer");
		authorBillet.setType(PositionType.ADVISOR);
		authorBillet.setOrganization(org);
		authorBillet = httpQuery("/positions/new", author).post(Entity.json(authorBillet), Position.class);
		assertThat(authorBillet.getId()).isNotNull();
		
		//Set this author in this billet
		Response resp = httpQuery(String.format("/positions/%d/person", authorBillet.getId()), author).post(Entity.json(author));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Create Approval workflow for Advising Organization
		Group approvingGroup = httpQuery("/groups/new", author)
				.post(Entity.json(Group.create("Test Group of initial approvers")), Group.class);
		resp = httpQuery(String.format("/groups/%d/addMember?personId=%d", approvingGroup.getId(), approver1.getId()), author)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		ApprovalStep approval = httpQuery("/approvalSteps/new", author)
				.post(Entity.json(ApprovalStep.create(null, approvingGroup, null, org.getId())), ApprovalStep.class);
		
		//Create Releasing approval step for AO. 
		Group releasingGroup = httpQuery("/groups/new", author)
				.post(Entity.json(Group.create("Test Group of releasers")), Group.class);
		resp = httpQuery(String.format("/groups/%d/addMember?personId=%d", releasingGroup.getId(), approver2.getId()), author)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Adding a new approval step to an AO automatically puts it at the end of the approval process. 
		ApprovalStep releaseApproval = httpQuery("/approvalSteps/new", author)
				.post(Entity.json(ApprovalStep.create(null, releasingGroup, null, org.getId())), ApprovalStep.class);
		assertThat(releaseApproval.getId()).isNotNull();
		
		//Pull the approval workflow for this AO
		List<ApprovalStep> steps = httpQuery("/approvalSteps/byOrganization?id=" + org.getId())
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(steps.size()).isEqualTo(2);
		assertThat(steps.get(0).getId()).isEqualTo(approval.getId());
		assertThat(steps.get(0).getNextStepId()).isEqualTo(releaseApproval.getId());
		assertThat(steps.get(1).getId()).isEqualTo(releaseApproval.getId());
		
		//TODO: Create a POAM structure for the AO
//		fail("No way to assign a POAM to an AO");
		Poam top = httpQuery("/poams/new", author)
				.post(Entity.json(Poam.create("test-1", "Test Top Poam", "TOP")), Poam.class);
		Poam action = httpQuery("/poams/new", author)
				.post(Entity.json(Poam.create("test-1-1", "Test Poam Action", "Action", top)), Poam.class);
		
		//Create a Location that this Report was written at
		Location loc = httpQuery("/locations/new", author)
				.post(Entity.json(Location.create("The Boat Dock", new LatLng(1.23,4.56))), Location.class);
		
		//Write a Report
		Report r = new Report();
		r.setAuthor(author);
//		r.setEngagementDate(DateTime.now());
		r.setAttendees(Lists.newArrayList(principal));
		r.setPoams(Lists.newArrayList(action));
		r.setLocation(loc);
		r.setAtmosphere(Atmosphere.POSITIVE);
		r.setAtmosphereDetails("Eerybody was super nice!");
		r.setIntent("A testing report to test that reporting reports");
		r.setReportText("Report Text goes here, asdfjk");
		r.setNextSteps("This is the next steps on a report");
		Report created = httpQuery("/reports/new", author)
				.post(Entity.json(r), Report.class);
		assertThat(created.getId()).isNotNull();
		assertThat(created.getState()).isEqualTo(ReportState.DRAFT);
		
		//Have the author submit the report
		resp = httpQuery(String.format("/reports/%d/submit", created.getId()), author).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Report returned = httpQuery(String.format("/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
		System.out.println("Expecting report " + returned.getId() + " in step " + approval.getId() + " because of org" + org.getId() + " on author " + author.getId());
		assertThat(returned.getApprovalStep().getId()).isEqualTo(approval.getId());
		
		//TODO: verify the location on this report
		//TODO: verify the principals on this report
		
		//TODO: verify the poams on this report
		
		//Verify this shows up on the approvers list of pending documents
		List<Report> pending = httpQuery("/reports/pendingMyApproval", approver1).get(new GenericType<List<Report>>() {});
		assertThat(pending).contains(returned);
		
		//Check on Report status for who needs to approve
		List<ApprovalAction> approvalStatus = returned.getApprovalStatus();
		assertThat(approvalStatus.size()).isEqualTo(2);
		ApprovalAction approvalAction = approvalStatus.get(0);
		assertThat(approvalAction.getPersonJson()).isNull(); //Because this hasn't been approved yet. 
		assertThat(approvalAction.getCreatedAt()).isNull();
		assertThat(approvalAction.getStep()).isEqualTo(steps.get(0)); 
		approvalAction = approvalStatus.get(1);
		assertThat(approvalAction.getStep()).isEqualTo(steps.get(1)); 
		
		//Reject the report
		resp = httpQuery(String.format("/reports/%d/reject", created.getId()), approver1)
				.post(Entity.json(Comment.withText("a test rejection")));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check on report status to verify it got put back to draft. 
		returned = httpQuery(String.format("/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.DRAFT);
		assertThat(returned.getApprovalStep()).isNull();
		
		//Author needs to re-submit
		resp = httpQuery(String.format("/reports/%d/submit", created.getId()), author).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//TODO: Approver modify the report *specifically change the attendees!* 
		
		//Approve the report
		resp = httpQuery(String.format("/reports/%d/approve", created.getId()), approver1).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check on Report status to verify it got moved forward
		returned = httpQuery(String.format("/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
		assertThat(returned.getApprovalStep().getId()).isEqualTo(releaseApproval.getId());
		
		//Verify that the wrong person cannot approve this report. 
		resp = httpQuery(String.format("/reports/%d/approve", created.getId()), approver1).get();
		assertThat(resp.getStatus()).isEqualTo(Status.FORBIDDEN.getStatusCode());
		
		//Approve the report
		resp = httpQuery(String.format("/reports/%d/approve", created.getId()), approver2).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check on Report status to verify it got moved forward
		returned = httpQuery(String.format("/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.RELEASED);
		assertThat(returned.getApprovalStep()).isNull();
		
		//check on report status to see that it got approved. 
		approvalStatus = returned.getApprovalStatus();
		assertThat(approvalStatus.size()).isEqualTo(2);
		approvalAction = approvalStatus.get(0);
		assertThat(approvalAction.getPersonJson().getId()).isEqualTo(approver1.getId()); 
		assertThat(approvalAction.getCreatedAt()).isNotNull();
		assertThat(approvalAction.getStep()).isEqualTo(steps.get(0));  
		approvalAction = approvalStatus.get(1);
		assertThat(approvalAction.getStep()).isEqualTo(steps.get(1));
		
		//Post a comment on the report because it's awesome
		Comment cOne = httpQuery(String.format("/reports/%d/comments", created.getId()), author)
				.post(Entity.json(CommentTest.fromText("This is a test comment one")), Comment.class);
		assertThat(cOne.getId()).isNotNull();
		assertThat(cOne.getReportId()).isEqualTo(created.getId());
		assertThat(cOne.getAuthor().getId()).isEqualTo(author.getId());
		
		Comment cTwo = httpQuery(String.format("/reports/%d/comments", created.getId()), approver1)
				.post(Entity.json(CommentTest.fromText("This is a test comment two")), Comment.class);
		assertThat(cTwo.getId()).isNotNull();
		
		List<Comment> commentsReturned = httpQuery(String.format("/reports/%d/comments", created.getId()), approver1)
			.get(new GenericType<List<Comment>>() {});
		assertThat(commentsReturned).hasSize(3); //the rejection comment will be there as well. 
		assertThat(commentsReturned).containsSequence(cOne, cTwo); //Assert order of comments! 

		//Search for this report by Author
		//Search for this report by Advisor
		//Search for this report by Location
		//Search for this report by Date
		//Search for this report by keyword
		//Search for this report by POAM (top level and bottom level)
		
	}
	
	@Test
	public void testDefaultApprovalFlow() { 
		Person jack = getJackJackson();
		//Create a Person who isn't in a Billet
		Person author = new Person();
		author.setName("A New Guy");
		author.setRole(Role.ADVISOR);
		author.setStatus(Person.Status.ACTIVE);
		author.setDomainUsername("newGuy");
		author.setEmailAddress("newGuy@example.com");
		author = httpQuery("/people/new", jack).post(Entity.json(author), Person.class);
		assertThat(author.getId()).isNotNull();
		
		//Write a report as that person
		Report r = new Report();
		r.setAuthor(author);
		r.setIntent("I am a new Advisor and wish to be included in things");
		r.setAtmosphere(Atmosphere.NEUTRAL);
		r.setReportText("I just got here in town and am writing a report for the first time, but have no reporting structure set up");
		r.setEngagementDate(DateTime.now());
		r = httpQuery("/reports/new", jack).post(Entity.json(r), Report.class);
		assertThat(r.getId()).isNotNull();
		
		//Submit the report
		Response resp = httpQuery("/reports/" + r.getId() + "/submit", jack)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check the approval Step
		Report returned = httpQuery("/reports/" + r.getId(), jack).get(Report.class);
		assertThat(returned.getId()).isEqualTo(r.getId());
		assertThat(returned.getState()).isEqualTo(Report.ReportState.PENDING_APPROVAL);
		
		//Find the default ApprovalSteps
		Integer defaultOrgId = Integer.parseInt(AnetObjectEngine.getInstance().getAdminSetting(AdminSettingKeys.DEFAULT_APPROVAL_ORGANIZATION));
		assertThat(defaultOrgId).isNotNull();
		List<ApprovalStep> steps = httpQuery("/approvalSteps/byOrganization?id=" + defaultOrgId, jack)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(steps).isNotNull();
		assertThat(steps).hasSize(1);
		assertThat(returned.getApprovalStepJson().getId()).isEqualTo(steps.get(0).getId());
		
		//Get the Person who is able to approve that report (nick@example.com)
		Person nick = new Person();
		nick.setDomainUsername("nick");
		
		//Create billet for Author
		Position billet = new Position();
		billet.setName("EF1 new advisor");
		billet.setType(Position.PositionType.ADVISOR);
		
		billet = httpQuery("/positions/new", nick)
				.post(Entity.json(billet), Position.class);
		assertThat(billet.getId()).isNotNull();
		
		//Put Author in the billet
		resp = httpQuery("/positions/" + billet.getId() + "/person", nick)
				.post(Entity.json(author));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Have Super User kick the report, it should be re-assigned to the default approval path because the billet has no Org
		resp = httpQuery("/reports/" + r.getId() + "/submit", nick).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		returned = httpQuery("/reports/" + r.getId(), jack).get(Report.class);
		assertThat(returned.getApprovalStepJson().getId()).isEqualTo(steps.get(0).getId());
		
		//Put billet in EF1
		List<Organization> results = httpQuery("/organizations/search?q=EF1&type=ADVISOR_ORG", nick).get(new GenericType<List<Organization>>() {});
		assertThat(results.size()).isGreaterThan(0);
		Organization ef1 = null;
		for (Organization org : results) { 
			if (org.getName().trim().equalsIgnoreCase("ef1")) { 
				billet.setOrganization(Organization.createWithId(org.getId()));
				ef1 = org;
				break;
			}
		}
		assertThat(billet.getOrganization()).isNotNull();
		assertThat(ef1).isNotNull();
		
		resp = httpQuery("/positions/update", nick).post(Entity.json(billet));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Nick should kick the report
		resp = httpQuery("/reports/" + r.getId() + "/submit", nick).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Report should now be up for review by EF1 approvers
		Report returned2 = httpQuery("/reports/" + r.getId(), jack).get(Report.class);
		assertThat(returned2.getId()).isEqualTo(r.getId());
		assertThat(returned2.getState()).isEqualTo(Report.ReportState.PENDING_APPROVAL);
		assertThat(returned2.getApprovalStepJson().getId()).isNotEqualTo(returned.getApprovalStepJson().getId());		
	}
	
	@Test
	public void reportEditTest() { 
        //Elizabeth writes a report about meeting with Roger
        Person elizabeth = getElizabethElizawell();
        Person roger = getRogerRogwell();
        Person nick = getNickNicholson();
        Person bob = getBobBobtown();
        
        //Fetch some objects from the DB that we'll use later. 
        List<Location> locSearchResults = httpQuery("/locations/search?q=Police", elizabeth)
                .get(new GenericType<List<Location>>() {});
        assertThat(locSearchResults.size()).isGreaterThan(0);
        Location loc = locSearchResults.get(0);
        
        List<Poam> poamSearchResults = httpQuery("/poams/search?q=Budgeting", elizabeth)
        		.get(new GenericType<List<Poam>>() {});
        assertThat(poamSearchResults.size()).isGreaterThan(2);    
        
        Report r = new Report();
        r.setIntent("A Test Report to test editing reports");
        r.setAuthor(elizabeth);
        r.setAtmosphere(Atmosphere.POSITIVE);
        r.setAtmosphereDetails("it was a cold, cold day");
        r.setEngagementDate(DateTime.now());
        r.setReportText("This report was generated by ReportsResourceTest#reportEditTest");
        r.setAttendees(ImmutableList.of(PersonTest.personToReportPerson(roger)));
        r.setPoams(ImmutableList.of(poamSearchResults.get(0)));
        Report returned = httpQuery("/reports/new", elizabeth).post(Entity.json(r), Report.class);
        assertThat(returned.getId()).isNotNull();

        //Elizabeth edits the report (update locationId, addPerson, remove a Poam)
        returned.setLocation(loc);
        returned.setAttendees(ImmutableList.of(PersonTest.personToReportPerson(roger), PersonTest.personToReportPerson(nick)));
        returned.setPoams(ImmutableList.of());
        Response resp = httpQuery("/reports/" + returned.getId() + "/edit", elizabeth).post(Entity.json(returned));
        assertThat(resp.getStatus()).isEqualTo(200);
        
        //Verify the report changed
        Report returned2 = httpQuery("/reports/" + returned.getId(), elizabeth).get(Report.class);
        assertThat(returned2.getIntent()).isEqualTo(r.getIntent());
        assertThat(returned2.getLocationJson().getId()).isEqualTo(loc.getId());
        assertThat(returned2.getPoams()).isEmpty(); //yes this does a DB load :(
        assertThat(returned2.getAttendees()).hasSize(2);
        assertThat(returned2.getAttendees().contains(roger));
        
        //Elizabeth submits the report
        resp = httpQuery("/reports/" + returned.getId() + "/submit", elizabeth).get();
        assertThat(resp.getStatus()).isEqualTo(200);
        Report returned3 = httpQuery("/reports/" + returned.getId(), elizabeth).get(Report.class);
        assertThat(returned3.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
        
        //Bob gets the approval (EF1 Approvers)
        List<Report> pendingBobsApproval = httpQuery("/reports/pendingMyApproval", bob).get(new GenericType<List<Report>>() {});
        assertThat(pendingBobsApproval.stream().anyMatch(rpt -> rpt.getId().equals(returned3.getId()))).isTrue();
        
        //Bob edits the report (change reportText, remove Person, add a Poam)
        returned3.setReportText(r.getReportText() + ", edited by Bob!!");
        returned3.setAttendees(ImmutableList.of(PersonTest.personToReportPerson(nick)));
        returned3.setPoams(ImmutableList.of(poamSearchResults.get(1), poamSearchResults.get(2)));
        resp = httpQuery("/reports/" + returned.getId() + "/edit", bob).post(Entity.json(returned3));
        
        Report returned4 = httpQuery("/reports/" + returned.getId(), elizabeth).get(Report.class);
        assertThat(returned4.getReportText()).endsWith("Bob!!");
        assertThat(returned4.getAttendees()).hasSize(1);
        assertThat(returned4.getAttendees()).contains(PersonTest.personToReportPerson(nick));
        assertThat(returned4.getPoams()).hasSize(2);
        
        resp = httpQuery("/reports/" + returned.getId() + "/approve", bob).get();
        assertThat(resp.getStatus()).isEqualTo(200);
	}
	
	@Test
	public void viewTest() { 
		Person jack = getJackJackson();
		Response resp = httpQuery("/reports/", jack)
			.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		String respBody = getResponseBody(resp);
		assertThat(respBody).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		Pattern reportIdPat = Pattern.compile("href=\"/reports/([0-9]+)\"");
		Matcher reportIdMat = reportIdPat.matcher(respBody);
		assertThat(reportIdMat.find());
		int reportId = Integer.parseInt(reportIdMat.group(1));
		
		resp = httpQuery("/reports/new", jack)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/reports/" + reportId, jack)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
		
		resp = httpQuery("/reports/" + reportId + "/edit", jack)
				.header("Accept", "text/html").get();
		assertThat(resp.getStatus()).isEqualTo(200);
		assertThat(getResponseBody(resp)).as("FreeMarker error").doesNotContain("FreeMarker template error");
	}
}
