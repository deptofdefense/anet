package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.database.PersonDao;

@Path("/api/people")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class PersonResource {
	
	private PersonDao dao;
	
	public PersonResource(AnetObjectEngine engine) { 
		this.dao = engine.getPersonDao();
	}
	
	/**
	 * Returns all people objects in the ANET system. Does no filtering on role/status/etc. 
	 * @param pageNum 0 indexed page number of results to get. Defaults to 0. 
	 * @param pageSize Defaults to 100
	 * @return List of People objects in the system
	 */
	@GET
	@Path("/")
	public List<Person> getAllPeople(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return dao.getAll(pageNum, pageSize);
	}
	
	/**
	 * Returns a single person entry based on ID. 
	 */
	@GET
	@Path("/{id}")
	@Produces(MediaType.APPLICATION_JSON)
	public Person getById(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		if (p == null) { throw new WebApplicationException("No such person", Status.NOT_FOUND); }
		return p;
	}
	
	
	/**
	 * Creates a new {@link Person} object as supplied in http entity. 
	 * @return the same Person object with the ID field filled in. 
	 */
	@POST
	@Path("/new")
	@RolesAllowed("SUPER_USER")
	public Person createNewPerson(Person p) { 
		return dao.insert(p);
	}
	
	/**
	 * Will update a person record with the {@link Person} entity provided in the http entity. All fields will be updated, so you must pass the complete Person object.
	 * Must be 
	 *   1) The person editing yourself
	 *   2) A super user for the person's organization
	 *   3) An administrator 
	 * @return HTTP/200 on success, HTTP/404 on any error. 
	 */
	@POST
	@Path("/update")
	public Response updatePerson(@Auth Person user, Person p) {
		if (canEditPerson(user, p) == false) { 
			throw new WebApplicationException("You are not permitted to do this", Status.UNAUTHORIZED);
		}
		int numRows = dao.update(p);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	private boolean canEditPerson(Person editor, Person subject) { 
		if (editor.getId().equals(subject.getId())) { 
			return true;
		}
		Position editorPos = editor.getPositionJson();
		if (editorPos == null) { return false; } 
		if (editorPos.getType() == PositionType.ADMINISTRATOR) { return true; } 
		if (editorPos.getType() == PositionType.SUPER_USER) { 
			//Ensure that the editor is the Super User for the subject's organization.
			Position subjectPos = subject.getPosition();
			if (subjectPos != null && subjectPos.getOrganizationJson() != null &&
					editorPos.getOrganizationJson() != null && 
					subjectPos.getOrganizationJson().getId().equals(editorPos.getOrganizationJson().getId())) { 
				return true;
			}
		}
		return false;
	}
	
//	@DELETE
//	@Path("/{id}")
//	public Response deletePerson(@PathParam("id") int id) {
//		//TODO: should this operation be allowed?
		//TODO: no, this should soft delete! 
//		dao.deletePersonById(id);
//		return Response.ok().build();
//	}
	
	/**
	 * Searches people in the ANET database TODO: should be fuzzy searching
	 * @param query the search term
	 * @param role either PRINCIPAL, or ADVISOR will search people with that role. 
	 * @return a list of people objects
	 */
	@GET
	@Path("/search")
	public List<Person> searchByName(@QueryParam("q") String query, @QueryParam("role") Role role) {
		return dao.searchByName(query, role);
	}
	
	/**
	 * Fetches the current position that a given person  is in. 
	 * @param personId the ID number of the person whose position you want to lookup
	 */
	@GET
	@Path("/{id}/position")
	public Position getPositionForPerson(@PathParam("personId") int personId) { 
		return AnetObjectEngine.getInstance().getPositionDao().getCurrentPositionForPerson(Person.createWithId(personId));
	}
	
}
