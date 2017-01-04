package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.LinkedList;
import java.util.List;

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
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.beans.search.ReportSearchQuery;
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
		Person admin = getArthurDmin();
		
		//Create a principal for the report
		ReportPerson principal = PersonTest.personToReportPerson(getSteveSteveson());
		principal.setPrimary(true);
		Position principalPosition = principal.getPosition();
		assertThat(principalPosition).isNotNull();
		Organization principalOrg = principalPosition.getOrganization();
		assertThat(principalOrg).isNotNull();
		
		//Create an Advising Organization for the report writer
		Organization advisorOrg = httpQuery("/api/organizations/new", admin)
				.post(Entity.json(OrganizationTest.getTestAO()), Organization.class);
		
		//Create leadership people in the AO who can approve this report
		Person approver1 = new Person();
		approver1.setDomainUsername("testApprover1");
		approver1.setEmailAddress("hunter+testApprover1@dds.mil");
		approver1.setName("Test Approver 1");
		approver1.setRole(Role.ADVISOR);
		approver1.setStatus(Person.Status.ACTIVE);
		approver1 = findOrPutPersonInDb(approver1);
		Person approver2 = new Person();
		approver2.setDomainUsername("testApprover2");
		approver2.setEmailAddress("hunter+testApprover2@dds.mil");
		approver2.setName("Test Approver 2");
		approver2.setRole(Person.Role.ADVISOR);
		approver2.setStatus(Person.Status.ACTIVE);
		approver2 = findOrPutPersonInDb(approver2);
		
		//Create a billet for the author
		Position authorBillet = new Position();
		authorBillet.setName("A report writer");
		authorBillet.setType(PositionType.ADVISOR);
		authorBillet.setOrganization(advisorOrg);
		authorBillet = httpQuery("/api/positions/new", admin).post(Entity.json(authorBillet), Position.class);
		assertThat(authorBillet.getId()).isNotNull();
		
		//Set this author in this billet
		Response resp = httpQuery(String.format("/api/positions/%d/person", authorBillet.getId()), admin).post(Entity.json(author));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Create Approval workflow for Advising Organization
		Group approvingGroup = httpQuery("/api/groups/new", author)
				.post(Entity.json(Group.create("Test Group of initial approvers")), Group.class);
		resp = httpQuery(String.format("/api/groups/%d/addMember?personId=%d", approvingGroup.getId(), approver1.getId()), admin)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		ApprovalStep approval = httpQuery("/api/approvalSteps/new", admin)
				.post(Entity.json(ApprovalStep.create(null, approvingGroup, null, advisorOrg.getId())), ApprovalStep.class);
		
		//Create Releasing approval step for AO. 
		Group releasingGroup = httpQuery("/api/groups/new", admin)
				.post(Entity.json(Group.create("Test Group of releasers")), Group.class);
		resp = httpQuery(String.format("/api/groups/%d/addMember?personId=%d", releasingGroup.getId(), approver2.getId()), admin)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Adding a new approval step to an AO automatically puts it at the end of the approval process. 
		ApprovalStep releaseApproval = httpQuery("/api/approvalSteps/new", admin)
				.post(Entity.json(ApprovalStep.create(null, releasingGroup, null, advisorOrg.getId())), ApprovalStep.class);
		assertThat(releaseApproval.getId()).isNotNull();
		
		//Pull the approval workflow for this AO
		List<ApprovalStep> steps = httpQuery("/api/approvalSteps/byOrganization?orgId=" + advisorOrg.getId(), admin)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(steps.size()).isEqualTo(2);
		assertThat(steps.get(0).getId()).isEqualTo(approval.getId());
		assertThat(steps.get(0).getNextStepId()).isEqualTo(releaseApproval.getId());
		assertThat(steps.get(1).getId()).isEqualTo(releaseApproval.getId());
		
		//Create some poams for this organization
		Poam top = httpQuery("/api/poams/new", admin)
				.post(Entity.json(Poam.create("test-1", "Test Top Poam", "TOP", null, advisorOrg)), Poam.class);
		Poam action = httpQuery("/api/poams/new", admin)
				.post(Entity.json(Poam.create("test-1-1", "Test Poam Action", "Action", top, null)), Poam.class);
		
		//Create a Location that this Report was written at
		Location loc = httpQuery("/api/locations/new", admin)
				.post(Entity.json(Location.create("The Boat Dock", 1.23,4.56)), Location.class);

		//Write a Report
		Report r = new Report();
		r.setAuthor(author);
		r.setEngagementDate(DateTime.now());
		r.setAttendees(Lists.newArrayList(principal));
		r.setPoams(Lists.newArrayList(action));
		r.setLocation(loc);
		r.setAtmosphere(Atmosphere.POSITIVE);
		r.setAtmosphereDetails("Eerybody was super nice!");
		r.setIntent("A testing report to test that reporting reports");
		r.setReportText("Report Text goes here, asdfjk");
		r.setNextSteps("This is the next steps on a report");
		r.setAdvisorOrg(advisorOrg);
		r.setPrincipalOrg(principalOrg);
		Report created = httpQuery("/api/reports/new", author)
				.post(Entity.json(r), Report.class);
		assertThat(created.getId()).isNotNull();
		assertThat(created.getState()).isEqualTo(ReportState.DRAFT);
		
		//Have the author submit the report
		resp = httpQuery(String.format("/api/reports/%d/submit", created.getId()), author).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		Report returned = httpQuery(String.format("/api/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
		System.out.println("Expecting report " + returned.getId() + " in step " + approval.getId() + " because of org" + advisorOrg.getId() + " on author " + author.getId());
		assertThat(returned.getApprovalStep().getId()).isEqualTo(approval.getId());
		
		//verify the location on this report
		assertThat(returned.getLocation().getId()).isEqualTo(loc.getId());
		
		//verify the principals on this report
		assertThat(returned.getAttendees()).contains(principal);
		returned.setAttendees(null); //Annoyning, but required to make future .equals checks pass, because we just caused a lazy load. 
		
		//verify the poams on this report
		assertThat(returned.getPoams()).contains(action);
		returned.setPoams(null);
		
		//Verify this shows up on the approvers list of pending documents
		List<Report> pending = httpQuery("/api/reports/pendingMyApproval", approver1).get(new GenericType<List<Report>>() {});
		int id = returned.getId();
		Report expected = pending.stream().filter(re -> re.getId().equals(id)).findFirst().get();
		expected.equals(returned);
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
		resp = httpQuery(String.format("/api/reports/%d/reject", created.getId()), approver1)
				.post(Entity.json(Comment.withText("a test rejection")));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check on report status to verify it got put back to draft. 
		returned = httpQuery(String.format("/api/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.DRAFT);
		assertThat(returned.getApprovalStep()).isNull();
		
		//Author needs to re-submit
		resp = httpQuery(String.format("/api/reports/%d/submit", created.getId()), author).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//TODO: Approver modify the report *specifically change the attendees!* 
		
		//Approve the report
		resp = httpQuery(String.format("/api/reports/%d/approve", created.getId()), approver1).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check on Report status to verify it got moved forward
		returned = httpQuery(String.format("/api/reports/%d", created.getId()), author).get(Report.class);
		assertThat(returned.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
		assertThat(returned.getApprovalStep().getId()).isEqualTo(releaseApproval.getId());
		
		//Verify that the wrong person cannot approve this report. 
		resp = httpQuery(String.format("/api/reports/%d/approve", created.getId()), approver1).get();
		assertThat(resp.getStatus()).isEqualTo(Status.FORBIDDEN.getStatusCode());
		
		//Approve the report
		resp = httpQuery(String.format("/api/reports/%d/approve", created.getId()), approver2).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check on Report status to verify it got moved forward
		returned = httpQuery(String.format("/api/reports/%d", created.getId()), author).get(Report.class);
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
		Comment cOne = httpQuery(String.format("/api/reports/%d/comments", created.getId()), author)
				.post(Entity.json(CommentTest.fromText("This is a test comment one")), Comment.class);
		assertThat(cOne.getId()).isNotNull();
		assertThat(cOne.getReportId()).isEqualTo(created.getId());
		assertThat(cOne.getAuthor().getId()).isEqualTo(author.getId());
		
		Comment cTwo = httpQuery(String.format("/api/reports/%d/comments", created.getId()), approver1)
				.post(Entity.json(CommentTest.fromText("This is a test comment two")), Comment.class);
		assertThat(cTwo.getId()).isNotNull();
		
		List<Comment> commentsReturned = httpQuery(String.format("/api/reports/%d/comments", created.getId()), approver1)
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
		Person admin = getArthurDmin();
		Person roger = getRogerRogwell();
		
		//Create a Person who isn't in a Billet
		Person author = new Person();
		author.setName("A New Guy");
		author.setRole(Role.ADVISOR);
		author.setStatus(Person.Status.ACTIVE);
		author.setDomainUsername("newGuy");
		author.setEmailAddress("newGuy@example.com");
		author = httpQuery("/api/people/new", admin).post(Entity.json(author), Person.class);
		assertThat(author.getId()).isNotNull();
		
		List<ReportPerson> attendees = ImmutableList.of(PersonTest.personToPrimaryReportPerson(roger), PersonTest.personToPrimaryReportPerson(jack));
		
		//Write a report as that person
		Report r = new Report();
		r.setAuthor(author);
		r.setIntent("I am a new Advisor and wish to be included in things");
		r.setAtmosphere(Atmosphere.NEUTRAL);
		r.setAttendees(attendees);
		r.setReportText("I just got here in town and am writing a report for the first time, but have no reporting structure set up");
		r.setEngagementDate(DateTime.now());
		r = httpQuery("/api/reports/new", jack).post(Entity.json(r), Report.class);
		assertThat(r.getId()).isNotNull();
		
		//Submit the report
		Response resp = httpQuery("/api/reports/" + r.getId() + "/submit", jack)
				.get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Check the approval Step
		Report returned = httpQuery("/api/reports/" + r.getId(), jack).get(Report.class);
		assertThat(returned.getId()).isEqualTo(r.getId());
		assertThat(returned.getState()).isEqualTo(Report.ReportState.PENDING_APPROVAL);
		
		//Find the default ApprovalSteps
		Integer defaultOrgId = Integer.parseInt(AnetObjectEngine.getInstance().getAdminSetting(AdminSettingKeys.DEFAULT_APPROVAL_ORGANIZATION));
		assertThat(defaultOrgId).isNotNull();
		List<ApprovalStep> steps = httpQuery("/api/approvalSteps/byOrganization?orgId=" + defaultOrgId, jack)
				.get(new GenericType<List<ApprovalStep>>() {});
		assertThat(steps).isNotNull();
		assertThat(steps).hasSize(1);
		assertThat(returned.getApprovalStepJson().getId()).isEqualTo(steps.get(0).getId());
		
		//Get the Person who is able to approve that report (nick@example.com)
		Person nick = new Person();
		nick.setDomainUsername("nick");
		
		//Create billet for Author
		Position billet = new Position();
		billet.setName("EF1.1 new advisor");
		billet.setType(Position.PositionType.ADVISOR);
		
		//Put billet in EF1
		List<Organization> results = httpQuery("/api/organizations/search?text=EF1&type=ADVISOR_ORG", nick).get(new GenericType<List<Organization>>() {});
		assertThat(results.size()).isGreaterThan(0);
		Organization ef1 = null;
		for (Organization org : results) { 
			if (org.getName().trim().equalsIgnoreCase("ef1.1")) { 
				billet.setOrganization(Organization.createWithId(org.getId()));
				ef1 = org;
				break;
			}
		}
		assertThat(billet.getOrganization()).isNotNull();
		assertThat(ef1).isNotNull();
		
		billet = httpQuery("/api/positions/new", admin)
				.post(Entity.json(billet), Position.class);
		assertThat(billet.getId()).isNotNull();
		
		//Put Author in the billet
		resp = httpQuery("/api/positions/" + billet.getId() + "/person", admin)
				.post(Entity.json(author));
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Nick should kick the report
		resp = httpQuery("/api/reports/" + r.getId() + "/submit", nick).get();
		assertThat(resp.getStatus()).isEqualTo(200);
		
		//Report should now be up for review by EF1 approvers
		Report returned2 = httpQuery("/api/reports/" + r.getId(), jack).get(Report.class);
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
        List<Location> locSearchResults = httpQuery("/api/locations/search?text=Police", elizabeth)
                .get(new GenericType<List<Location>>() {});
        assertThat(locSearchResults.size()).isGreaterThan(0);
        Location loc = locSearchResults.get(0);
        
        List<Poam> poamSearchResults = httpQuery("/api/poams/search?text=Budgeting", elizabeth)
        		.get(new GenericType<List<Poam>>() {});
        assertThat(poamSearchResults.size()).isGreaterThan(2);    
        
        Report r = new Report();
        r.setIntent("A Test Report to test editing reports");
        r.setAuthor(elizabeth);
        r.setAtmosphere(Atmosphere.POSITIVE);
        r.setAtmosphereDetails("it was a cold, cold day");
        r.setEngagementDate(DateTime.now());
        r.setReportText("This report was generated by ReportsResourceTest#reportEditTest");
        r.setAttendees(ImmutableList.of(PersonTest.personToPrimaryReportPerson(roger)));
        r.setPoams(ImmutableList.of(poamSearchResults.get(0)));
        Report returned = httpQuery("/api/reports/new", elizabeth).post(Entity.json(r), Report.class);
        assertThat(returned.getId()).isNotNull();

        //Elizabeth edits the report (update locationId, addPerson, remove a Poam)
        returned.setLocation(loc);
        returned.setAttendees(ImmutableList.of(PersonTest.personToPrimaryReportPerson(roger), PersonTest.personToReportPerson(nick), PersonTest.personToPrimaryReportPerson(elizabeth)));
        returned.setPoams(ImmutableList.of());
        Response resp = httpQuery("/api/reports/" + returned.getId() + "/edit", elizabeth).post(Entity.json(returned));
        assertThat(resp.getStatus()).isEqualTo(200);
        
        //Verify the report changed
        Report returned2 = httpQuery("/api/reports/" + returned.getId(), elizabeth).get(Report.class);
        assertThat(returned2.getIntent()).isEqualTo(r.getIntent());
        assertThat(returned2.getLocationJson().getId()).isEqualTo(loc.getId());
        assertThat(returned2.getPoams()).isEmpty(); //yes this does a DB load :(
        assertThat(returned2.getAttendees()).hasSize(3);
        assertThat(returned2.getAttendees().contains(roger));
        
        //Elizabeth submits the report
        resp = httpQuery("/api/reports/" + returned.getId() + "/submit", elizabeth).get();
        assertThat(resp.getStatus()).isEqualTo(200);
        Report returned3 = httpQuery("/api/reports/" + returned.getId(), elizabeth).get(Report.class);
        assertThat(returned3.getState()).isEqualTo(ReportState.PENDING_APPROVAL);
        
        //Bob gets the approval (EF1 Approvers)
        List<Report> pendingBobsApproval = httpQuery("/api/reports/pendingMyApproval", bob).get(new GenericType<List<Report>>() {});
        assertThat(pendingBobsApproval.stream().anyMatch(rpt -> rpt.getId().equals(returned3.getId()))).isTrue();
        
        //Bob edits the report (change reportText, remove Person, add a Poam)
        returned3.setReportText(r.getReportText() + ", edited by Bob!!");
        returned3.setAttendees(ImmutableList.of(PersonTest.personToReportPerson(nick)));
        returned3.setPoams(ImmutableList.of(poamSearchResults.get(1), poamSearchResults.get(2)));
        resp = httpQuery("/api/reports/" + returned.getId() + "/edit", bob).post(Entity.json(returned3));
        
        Report returned4 = httpQuery("/api/reports/" + returned.getId(), elizabeth).get(Report.class);
        assertThat(returned4.getReportText()).endsWith("Bob!!");
        assertThat(returned4.getAttendees()).hasSize(1);
        assertThat(returned4.getAttendees()).contains(PersonTest.personToReportPerson(nick));
        assertThat(returned4.getPoams()).hasSize(2);
        
        resp = httpQuery("/api/reports/" + returned.getId() + "/approve", bob).get();
        assertThat(resp.getStatus()).isEqualTo(200);
	}
	
	@Test
	public void searchTest() { 
		Person jack =  getJackJackson();
		Person steve = getSteveSteveson();
		ReportSearchQuery query = new ReportSearchQuery();
		
		//Search based on report Text body
		query.setText("spreadsheet");
		List<Report> searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		
		//Search based on summary
		query.setText("Amherst");
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		
		//Search by Author
		query.setText(null);
		query.setAuthorId(jack.getId());
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream()
				.filter(r -> (r.getAuthorJson().getId().equals(jack.getId()))).count())
			.isEqualTo(searchResults.size());
		int numResults = searchResults.size();
		
		//Search by Author with Date Filtering
		query.setEngagementDateStart(new DateTime(2016,6,1,0,0));
		query.setEngagementDateEnd(new DateTime(2016,6,15,0,0,0));
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.size()).isLessThan(numResults);
		
		//Search by Attendee
		query.setEngagementDateStart(null);
		query.setEngagementDateEnd(null);
		query.setAuthorId(null);
		query.setAttendeeId(steve.getId());
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream().filter(r -> 
			r.getAttendees().stream().anyMatch(rp -> 
				(rp.getId().equals(steve.getId()))
			))).hasSameSizeAs(searchResults);
		
		List<Poam> poamResults = httpQuery("/api/poams/search?text=1.1.A", jack).get(new GenericType<List<Poam>>() {});
		assertThat(poamResults).isNotEmpty();
		Poam poam = poamResults.get(0);
		
		//Search by Poam
		query.setAttendeeId(null);
		query.setPoamId(poam.getId());
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream().filter(r -> 
				r.getPoams().stream().anyMatch(p -> 
					p.getId().equals(poam.getId()))	
			)).hasSameSizeAs(searchResults);
		
		//Search by direct organization
		List<Organization> orgs = httpQuery("/api/organizations/search?type=ADVISOR_ORG&text=EF1", jack).get(new GenericType<List<Organization>>() {});
		assertThat(orgs.size()).isGreaterThan(0);
		Organization ef11 = orgs.stream().filter(o -> o.getName().equals("EF1.1")).findFirst().get();
		assertThat(ef11.getName()).isEqualToIgnoringCase("EF1.1");
		
		query.setPoamId(null);
		query.setAuthorOrgId(ef11.getId());
		query.setIncludeAuthorOrgChildren(false);
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream().filter(r -> 
				r.getAuthor().getPosition().getOrganization().getId().equals(ef11.getId())
			)).hasSameSizeAs(searchResults);
		
		//Search by parent organization
		orgs = httpQuery("/api/organizations/search?type=ADVISOR_ORG&text=ef1", jack).get(new GenericType<List<Organization>>() {});
		assertThat(orgs.size()).isGreaterThan(0);
		Organization ef1 = orgs.stream().filter(o -> o.getName().equalsIgnoreCase("ef1")).findFirst().get();
		assertThat(ef1.getName()).isEqualToIgnoringCase("EF1");
		
		query.setPoamId(null);
		query.setAuthorOrgId(ef1.getId());
		query.setIncludeAuthorOrgChildren(true);
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		//#TODO: figure out how to verify the results? 
		
		//Search by location
		List<Location> locs = httpQuery("/api/locations/search?text=Cabot", jack).get(new GenericType<List<Location>>() {});
		assertThat(locs.size() == 0);
		Location cabot = locs.get(0);
		
		query.setAuthorOrgId(null);
		query.setLocationId(cabot.getId());
		searchResults = httpQuery("/api/reports/search", jack).post(Entity.json(query), new GenericType<List<Report>>() {});
		assertThat(searchResults).isNotEmpty();
		assertThat(searchResults.stream().filter(r -> 
				r.getLocation().getId().equals(cabot.getId())
			)).hasSameSizeAs(searchResults);
		
		//Search by Principal Organization
		
		//Search by Principal Parent Organization
	}
}
