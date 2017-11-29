package mil.dds.anet.resources;

import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.codahale.metrics.annotation.Timed;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.PersonStatus;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PersonList;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.AnetAuditLogger;
import mil.dds.anet.utils.AuthUtils;
import mil.dds.anet.utils.ResponseUtils;
import mil.dds.anet.utils.Utils;

@Path("/api/people")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class PersonResource implements IGraphQLResource {
	
	private PersonDao dao;
	private AnetConfiguration config;
	
	public PersonResource(AnetObjectEngine engine, AnetConfiguration config) {
		this.dao = engine.getPersonDao();
		this.config = config;
	}
	
	@Override
	public Class<Person> getBeanClass() {
		return Person.class; 
	} 
	
	@Override
	public Class<PersonList> getBeanListClass() {
		return PersonList.class;
	}
	
	@Override
	public String getDescription() {
		return "People"; 
	}
	
	/**
	 * Returns all people objects in the ANET system. Does no filtering on role/status/etc. 
	 * @param pageNum 0 indexed page number of results to get. Defaults to 0. 
	 * @param pageSize Defaults to 100
	 * @return List of People objects in the system
	 */
	@GET
	@Timed
	@GraphQLFetcher
	@Path("/")
	public PersonList getAll(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return dao.getAll(pageNum, pageSize);
	}
	
	/**
	 * Returns a single person entry based on ID. 
	 */
	@GET
	@Timed
	@Path("/{id}")
	@GraphQLFetcher
	public Person getById(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		if (p == null) { throw new WebApplicationException("No such person", Status.NOT_FOUND); }
		return p;
	}
	
	
	/**
	 * Creates a new {@link Person} object as supplied in http entity. 
	 * Optional: 
	 * - position: If you provide a Position ID number in the Position object, 
	 *     this person will be associated with that position (Potentially removing anybody currently in the position)
	 * @return the same Person object with the ID field filled in. 
	 */
	@POST
	@Timed
	@Path("/new")
	@RolesAllowed("SUPER_USER")
	public Person createNewPerson(@Auth Person user, Person p) {
		if (p.getRole().equals(Role.ADVISOR) && !Utils.isEmptyOrNull(p.getEmailAddress())) {
			validateEmail(p.getEmailAddress());
		}

		if (p.getPosition() != null && p.getPosition().getId() != null) { 
			Position position = AnetObjectEngine.getInstance().getPositionDao().getById(p.getPosition().getId());
			if (position == null) { 
				throw new WebApplicationException("Position " + p.getPosition() + " does not exist", Status.BAD_REQUEST);
			}
			if (position.getType() == PositionType.ADMINISTRATOR) { AuthUtils.assertAdministrator(user); } 
		}
		
		p.setBiography(Utils.sanitizeHtml(p.getBiography()));
		Person created = dao.insert(p);
		
		if (created.getPosition() != null) { 
			AnetObjectEngine.getInstance().getPositionDao().setPersonInPosition(created, created.getPosition());
		}
		
		AnetAuditLogger.log("Person {} created by {}", p, user);
		return created;
	}
	
	/**
	 * Will update a person record with the {@link Person} entity provided in the http entity. 
	 * All fields will be updated, so you must pass the complete Person object.
	 * Optional:
	 *  - position: If you provide a position on the Person, then this person will be updated to 
	 *      be in that position (unless they already are in that position).  If position is an empty 
	 *      object, the person will be REMOVED from their position.  
	 * Must be 
	 *   1) The person editing yourself
	 *   2) A super user for the person's organization
	 *   3) An administrator 
	 * @return HTTP/200 on success, HTTP/404 on any error. 
	 */
	@POST
	@Timed
	@Path("/update")
	public Response updatePerson(@Auth Person user, Person p) {
		Person existing = dao.getById(p.getId());
		if (canEditPerson(user, existing) == false) { 
			throw new WebApplicationException("You do not have permissions to edit this person", Status.FORBIDDEN);
		}

		if (p.getRole().equals(Role.ADVISOR) && !Utils.isEmptyOrNull(p.getEmailAddress())) {
			validateEmail(p.getEmailAddress());
		}
		
		//Swap the position first in order to do the authentication check. 
		if (p.getPosition() != null) {
			//Maybe update position? 
			Position existingPos = existing.loadPosition();
			if (existingPos == null && p.getPosition().getId() != null) {
				//Update the position for this person.
				AuthUtils.assertSuperUser(user);
				AnetObjectEngine.getInstance().getPositionDao().setPersonInPosition(p, p.getPosition());
				AnetAuditLogger.log("Person {} put in position {}  by {}", p, p.getPosition(), user);
			} else if (existingPos != null && existingPos.getId().equals(p.getPosition().getId()) == false) {
				//Update the position for this person.
				AuthUtils.assertSuperUser(user);
				AnetObjectEngine.getInstance().getPositionDao().setPersonInPosition(p, p.getPosition());
				AnetAuditLogger.log("Person {} put in position {}  by {}", p, p.getPosition(), user);
			} else if (existingPos != null && p.getPosition().getId() == null) {
				//Remove this person from their position.
				AuthUtils.assertSuperUser(user);
				AnetObjectEngine.getInstance().getPositionDao().removePersonFromPosition(existingPos);
				AnetAuditLogger.log("Person {} removed from position   by {}", p, user);
			}
		}

		// If person changed to inactive, clear out the domainUsername
		if (PersonStatus.INACTIVE.equals(p.getStatus()) && !PersonStatus.INACTIVE.equals(existing.getStatus())) {
			AnetAuditLogger.log("Person {} domainUsername '{}' cleared by {} because they are now inactive", p, existing.getDomainUsername(), user);
			p.setDomainUsername(null);
		}

		//Automatically remove people from a position if they are inactive.
		if (PersonStatus.INACTIVE.equals(p.getStatus()) && p.getPosition() != null) {
			Position existingPos = existing.loadPosition();
			if (existingPos != null) { 
				AuthUtils.assertSuperUser(user);
				AnetAuditLogger.log("Person {} removed from position by {} because they are now inactive", p, user);	
				AnetObjectEngine.getInstance().getPositionDao().removePersonFromPosition(existingPos);
			}
		}
		
		p.setBiography(Utils.sanitizeHtml(p.getBiography()));
		int numRows = dao.update(p);
		
		AnetAuditLogger.log("Person {} edited by {}", p, user);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	private boolean canEditPerson(Person editor, Person subject) { 
		if (editor.getId().equals(subject.getId())) { 
			return true;
		}
		Position editorPos = editor.getPosition();
		if (editorPos == null) { return false; } 
		if (editorPos.getType() == PositionType.ADMINISTRATOR) { return true; } 
		if (editorPos.getType() == PositionType.SUPER_USER) { 
			//Super Users can edit any principal
			if (subject.getRole().equals(Role.PRINCIPAL)) { return true; }
			//Ensure that the editor is the Super User for the subject's organization.
			Position subjectPos = subject.loadPosition();
			if (subjectPos == null) { 
				//Super Users can edit position-less people. 
				return true; 
			}
			return AuthUtils.isSuperUserForOrg(editor, subjectPos.getOrganization());
		}
		return false;
	}
	
	/**
	 * Searches people in the ANET database.
	 * @param query the search term
	 * @return a list of people objects
	 */
	@POST
	@Timed
	@GraphQLFetcher
	@Path("/search")
	public PersonList search(@GraphQLParam("query") PersonSearchQuery query) {
		return dao.search(query);
	}
	
	@GET
	@Timed
	@Path("/search")
	public PersonList search(@Context HttpServletRequest request) {
		try { 
			return search(ResponseUtils.convertParamsToBean(request, PersonSearchQuery.class));
		} catch (IllegalArgumentException e) { 
			throw new WebApplicationException(e.getMessage(), e.getCause(), Status.BAD_REQUEST);
		}
	}
	
	/**
	 * Fetches the current position that a given person  is in. 
	 * @param personId the ID number of the person whose position you want to lookup
	 */
	@GET
	@Timed
	@Path("/{id}/position")
	public Position getPositionForPerson(@PathParam("personId") int personId) { 
		return AnetObjectEngine.getInstance().getPositionDao().getCurrentPositionForPerson(Person.createWithId(personId));
	}
	
	/** 
	 * Returns the most recent people that this user listed as attendees in reports. 
	 * @param maxResults maximum number of results to return, defaults to 3
	 */
	@GET
	@Timed
	@GraphQLFetcher
	@Path("/recents")
	public PersonList recents(@Auth Person user,
			@DefaultValue("3") @QueryParam("maxResults") int maxResults) {
		return new PersonList(dao.getRecentPeople(user, maxResults));
	}
	
	/**
	 * Convenience method for API testing. 
	 */
	@GET
	@Timed
	@GraphQLFetcher("me")
	@Path("/me")
	public Person getCurrentUser(@Auth Person user) { 
		return user;
	}
	
	@POST
	@Timed
	@Path("/merge")
	@RolesAllowed("ADMINISTRATOR")
	public Response mergePeople(@Auth Person user, 
			@QueryParam("winner") int winnerId, 
			@QueryParam("loser") int loserId, 
			@QueryParam("copyPosition") @DefaultValue("false") Boolean copyPosition) {
		
		if (loserId == winnerId) { return Response.status(Status.NOT_ACCEPTABLE).build(); } 
		Person winner = dao.getById(winnerId);
		Person loser = dao.getById(loserId);
		
		if (winner == null || loser == null) { 
			return Response.status(Status.NOT_FOUND).build();
		}
		
		if (winner.getRole().equals(loser.getRole()) == false) { 
			return Response.status(Status.NOT_ACCEPTABLE).build();
		}
		if (winner.getPosition() != null && copyPosition) { 
			return Response.status(Status.NOT_ACCEPTABLE).build();
		}
		
		loser.loadPosition();
		winner.loadPosition();
		
		//Remove the loser from their position.
		Position loserPosition = loser.getPosition();
		if (loserPosition != null) { 
			AnetObjectEngine.getInstance().getPositionDao()
				.removePersonFromPosition(loserPosition);
		}
		
		dao.mergePeople(winner, loser, copyPosition);
		AnetAuditLogger.log("Person {} merged into WINNER: {}  by {}", loser, winner, user);
		
		if (loserPosition != null && copyPosition) { 
			AnetObjectEngine.getInstance().getPositionDao()
				.setPersonInPosition(winner, loserPosition);
			AnetAuditLogger.log("Person {} put in position {} as part of merge by {}", winner, loserPosition, user);
		} else if (winner.getPosition() != null) { 
			//We need to always re-put the winner back into their position
			// because when we removed the loser, and then updated the peoplePositions table
			// it now has a record saying the winner has no position. 
			AnetObjectEngine.getInstance().getPositionDao()
				.setPersonInPosition(winner, winner.getPosition());
		}
		
		return Response.ok().build();
	}

	private void validateEmail(String emailInput) {
		if (Utils.isEmptyOrNull(emailInput)) {
			throw new WebApplicationException(validateEmailErrorMessage(), Status.BAD_REQUEST);
		}

		final String WILDCARD = "*";
		final String[] splittedEmail = emailInput.split("@");
		final String from = splittedEmail[0].trim();
		final String domainName = splittedEmail[1];

		@SuppressWarnings("unchecked")
		final List<String> whitelistDomainNames = (List<String>)this.config.getDictionary().get("domainNames");

		final List<String> wildcardDomainNames = whitelistDomainNames.stream()
			.filter(domain -> String.valueOf(domain.charAt(0)).equals(WILDCARD))
			.collect((Collectors.toList()));

		final Boolean isWhitelistedEmail = from.length() > 0 && whitelistDomainNames.indexOf(domainName) > 0;
		final Boolean isValidWildcardDomain = wildcardDomainNames.stream()
			.anyMatch(wildcardDomain ->
				domainName.charAt(0) != '.' &&
				domainName.endsWith(wildcardDomain.substring(2)));

		if (!isWhitelistedEmail && !isValidWildcardDomain) {
			throw new WebApplicationException(validateEmailErrorMessage(), Status.BAD_REQUEST);
		}
	}

	private String validateEmailErrorMessage() {
		final String supportEmailAddr = (String)this.config.getDictionary().get("SUPPORT_EMAIL_ADDR");
		final String messageBody = "Only valid email domain names are allowed. If your email domain name is not in the list, please contact the support team";
		final String errorMessage = Utils.isEmptyOrNull(supportEmailAddr) ? messageBody : String.format("%s at %s", messageBody, supportEmailAddr);
		return errorMessage;
	}
}
