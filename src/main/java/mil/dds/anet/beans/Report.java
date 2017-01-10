package mil.dds.anet.beans;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.views.AbstractAnetBean;

public class Report extends AbstractAnetBean {

	public enum ReportState { DRAFT, PENDING_APPROVAL, RELEASED }
	public enum Atmosphere { POSITIVE, NEUTRAL, NEGATIVE }

	ApprovalStep approvalStep;
	ReportState state;
	
	DateTime engagementDate;
	Location location;
	String intent;
	String exsum; //can be null to autogenerate
	Atmosphere atmosphere;
	String atmosphereDetails;
	
	List<ReportPerson> attendees;
	List<Poam> poams;
	
	String keyOutcomesSummary;
	String keyOutcomes;
	String nextStepsSummary;
	String nextSteps;
	String reportText;
	
	Person author;	
	
	Organization advisorOrg;
	Organization principalOrg;
	
	List<Comment> comments;

	@GraphQLIgnore
	public ApprovalStep getApprovalStep() {
		return approvalStep;
	}

	public void setApprovalStep(ApprovalStep approvalStep) {
		this.approvalStep = approvalStep;
	}

	@GraphQLFetcher("approvalStep")
	public ApprovalStep loadApprovalStep() { 
		if (approvalStep == null || approvalStep.getLoadLevel() == null) { return approvalStep; } 
		if (approvalStep.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.approvalStep = AnetObjectEngine.getInstance()
				.getApprovalStepDao().getById(approvalStep.getId());
		}
		return approvalStep;
	}
	
	public ReportState getState() {
		return state;
	}	

	public void setState(ReportState state) {
		this.state = state;
	}

	public DateTime getEngagementDate() {
		return engagementDate;
	}

	public void setEngagementDate(DateTime engagementDate) {
		this.engagementDate = engagementDate;
	}

	@GraphQLFetcher("location")
	public Location loadLocation() {
		if (location == null || location.getLoadLevel() == null) { return location; } 
		if (location.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.location = AnetObjectEngine.getInstance()
					.getLocationDao().getById(location.getId());
		}
		return location;
	}

	public void setLocation(Location location) {
		this.location = location;
	}
	
	@GraphQLIgnore
	public Location getLocation() { 
		return location;
	}

	public String getIntent() {
		return intent;
	}

	public String getExsum() {
		return exsum;
	}

	public void setExsum(String exsum) {
		this.exsum = exsum;
	}

	public Atmosphere getAtmosphere() {
		return atmosphere;
	}

	public void setAtmosphere(Atmosphere atmosphere) {
		this.atmosphere = atmosphere;
	}

	public String getAtmosphereDetails() {
		return atmosphereDetails;
	}

	public void setAtmosphereDetails(String atmosphereDetails) {
		this.atmosphereDetails = atmosphereDetails;
	}

	public void setIntent(String intent) {
		this.intent = intent;
	}

	@GraphQLFetcher("attendees")
	public List<ReportPerson> loadAttendees() { 
		if (attendees == null && id != null) {
			attendees = AnetObjectEngine.getInstance().getReportDao().getAttendeesForReport(id);
		}
		return attendees;
	}
	
	@GraphQLIgnore
	public List<ReportPerson> getAttendees() {
		return attendees;
	}

	public void setAttendees(List<ReportPerson> attendees) {
		this.attendees = attendees;
	}

	@GraphQLFetcher("primaryAdvisor")
	public ReportPerson loadPrimaryAdvisor() { 
		loadAttendees(); //Force the load of attendees
		return attendees.stream().filter(p ->
				p.isPrimary() && p.getRole().equals(Role.ADVISOR)
			).findFirst().orElse(null);
	}
	
	@GraphQLFetcher("primaryPrincipal")
	public ReportPerson loadPrimaryPrincipal() { 
		loadAttendees(); //Force the load of attendees
		return attendees.stream().filter(p ->
				p.isPrimary() && p.getRole().equals(Role.PRINCIPAL)
			).findFirst().orElse(null);
	}
	
	@GraphQLFetcher("poams")
	public List<Poam> loadPoams() {
		if (poams == null) { 
			poams = AnetObjectEngine.getInstance().getReportDao().getPoamsForReport(this);
		}
		return poams;
	}

	public void setPoams(List<Poam> poams) {
		this.poams = poams;
	}
	
	@GraphQLIgnore
	public List<Poam> getPoams() { 
		return poams;
	}

	public String getKeyOutcomesSummary() {
		return keyOutcomesSummary;
	}

	public void setKeyOutcomesSummary(String keyOutcomesSummary) {
		this.keyOutcomesSummary = keyOutcomesSummary;
	}

	public String getKeyOutcomes() {
		return keyOutcomes;
	}

	public void setKeyOutcomes(String keyOutcomes) {
		this.keyOutcomes = keyOutcomes;
	}

	public String getNextStepsSummary() {
		return nextStepsSummary;
	}

	public void setNextStepsSummary(String nextStepsSummary) {
		this.nextStepsSummary = nextStepsSummary;
	}

	public String getReportText() {
		return reportText;
	}

	public void setReportText(String reportText) {
		this.reportText = reportText;
	}

	public String getNextSteps() {
		return nextSteps;
	}

	public void setNextSteps(String nextSteps) {
		this.nextSteps = nextSteps;
	}

	@GraphQLFetcher("author")
	public Person loadAuthor() {
		if (author == null || author.getLoadLevel() == null) { return author; } 
		if (author.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.author = getBeanAtLoadLevel(author, LoadLevel.PROPERTIES);
		}
		return author;
	}

	@JsonSetter("author")
	public void setAuthor(Person author) {
		this.author = author;
	}
	
	@GraphQLIgnore
	public Person getAuthor() { 
		return author;
	}
	
	@GraphQLIgnore
	public Organization getAdvisorOrg() {
		return advisorOrg;
	}

	public void setAdvisorOrg(Organization advisorOrg) {
		this.advisorOrg = advisorOrg;
	}

	@GraphQLFetcher("advisorOrg")
	public Organization loadAdvisorOrg() { 
		if (advisorOrg == null || advisorOrg.getLoadLevel() == null) { return advisorOrg; } 
		if (advisorOrg.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.advisorOrg = getBeanAtLoadLevel(advisorOrg, LoadLevel.PROPERTIES);
		}
		return advisorOrg;
	}
	
	@GraphQLIgnore
	public Organization getPrincipalOrg() {
		return principalOrg;
	}

	public void setPrincipalOrg(Organization principalOrg) {
		this.principalOrg = principalOrg;
	}

	@GraphQLFetcher("principalOrg")
	public Organization loadPrincipalOrg() { 
		if (principalOrg == null || principalOrg.getLoadLevel() == null) { return principalOrg; } 
		if (principalOrg.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.principalOrg = getBeanAtLoadLevel(principalOrg, LoadLevel.PROPERTIES);
		}
		return principalOrg;
	}
	
	@GraphQLFetcher("comments")
	public List<Comment> loadComments() {
		if (comments == null) {
			comments = AnetObjectEngine.getInstance().getCommentDao().getCommentsForReport(this);
		}
		return comments;
	}

	@JsonSetter("comments")
	public void setComments(List<Comment> comments) {
		this.comments = comments;
	}
	
	@GraphQLIgnore
	public List<Comment> getComments() { 
		return comments;
	}
	
	/*Returns a full list of the approval steps and statuses for this report
	 * There will be an approval action for each approval step for this report
	 * With information about the 
	 */
	@GraphQLFetcher("approvalStatus")
	public List<ApprovalAction> loadApprovalStatus() { 
		AnetObjectEngine engine = AnetObjectEngine.getInstance();
		List<ApprovalAction> actions = engine.getApprovalActionDao().getActionsForReport(this.getId());
		
		if (this.getState() == ReportState.RELEASED) {
			//Compact to only get the most recent event for each step.
			ApprovalAction last = actions.get(0);
			List<ApprovalAction> compacted = new LinkedList<ApprovalAction>();
			for (ApprovalAction action : actions) { 
				if (action.getStep().getId().equals(last.getStep().getId()) == false) { 
					compacted.add(last);
				}
				last = action;
			}
			compacted.add(actions.get(actions.size() - 1));
			return compacted;
		}
		
		Organization ao = engine.getOrganizationForPerson(getAuthor());
		if (ao == null) {
			//use the default approval workflow. 
			ao = Organization.createWithId(
					Integer.parseInt(engine.getAdminSetting(AdminSettingKeys.DEFAULT_APPROVAL_ORGANIZATION)));
		}
		
		List<ApprovalStep> steps = engine.getApprovalStepsForOrg(ao);
		if (steps == null || steps.size() == 0) {
			//No approval steps for this organization
			steps = engine.getApprovalStepsForOrg(Organization.createWithId(-1));
		}
				
		List<ApprovalAction> workflow = new LinkedList<ApprovalAction>();
		for (ApprovalStep step : steps) { 
			//If there is an Action for this step, grab the last one (date wise)
			Optional<ApprovalAction> existing = actions.stream().filter(a -> 
					a.getStep().getId().equals(step.getId())
				).max(new Comparator<ApprovalAction>(){
					public int compare(ApprovalAction a, ApprovalAction b) {
						return a.getCreatedAt().compareTo(b.getCreatedAt());
					}
				});
			ApprovalAction action;
			if (existing.isPresent()) { 
				action = existing.get();
			} else { 
				//If not then create a new one and attach this step
				action = new ApprovalAction();		
			}
			action.setStep(step);
			workflow.add(action);
		}
		return workflow;
	}
	
	@Override
	public boolean equals(Object other) { 
		if (other == null || other.getClass() != Report.class) { 
			return false;
		}
		Report r = (Report) other;
		return Objects.equals(r.getId(), id) &&
				Objects.equals(r.getState(), state) &&
				idEqual(r.getApprovalStep(), approvalStep) &&
				Objects.equals(r.getCreatedAt(), createdAt) &&
				Objects.equals(r.getUpdatedAt(), updatedAt) &&
				Objects.equals(r.getEngagementDate(), engagementDate) &&
				idEqual(r.getLocation(), location) &&
				Objects.equals(r.getIntent(), intent) &&
				Objects.equals(r.getExsum(), exsum) &&
				Objects.equals(r.getAtmosphere(), atmosphere) &&
				Objects.equals(r.getAtmosphereDetails(), atmosphereDetails) &&
				Objects.equals(r.getAttendees(), attendees) &&
				Objects.equals(r.getPoams(), poams) &&
				Objects.equals(r.getReportText(), reportText) &&
				Objects.equals(r.getNextSteps(), nextSteps) &&
				idEqual(r.getAuthor(), author) &&
				Objects.equals(r.getComments(), comments);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, state, approvalStep, createdAt, updatedAt, 
			location, intent, exsum, attendees, poams, reportText, 
			nextSteps, author, comments, atmosphere, atmosphereDetails, engagementDate);
	}

	public static Report createWithId(Integer id) {
		Report r = new Report();
		r.setId(id);
		r.setLoadLevel(LoadLevel.ID_ONLY);
		return r;
	}
	
	@Override
	public String toString() { 
		return String.format("[Report id#%d]", id);
	}
}
