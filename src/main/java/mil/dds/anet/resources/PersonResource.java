package mil.dds.anet.resources;

import java.util.List;

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

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.views.person.PersonListView;

@Path("/people")
@Produces(MediaType.APPLICATION_JSON)
public class PersonResource {

	private PersonDao dao;
	
	public PersonResource(AnetObjectEngine engine) { 
		this.dao = engine.getPersonDao();
	}
	
	@GET
	@Path("/")
	public List<Person> getAllPeople(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return dao.getAll(pageNum, pageSize);
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public PersonListView getAllPeopleView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new PersonListView(dao.getAll(pageNum, pageSize));
	}
	
	@GET
	@Path("/{id}")
	public Person getJSONById(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		if (p == null) { 
			throw new WebApplicationException("No person by that ID", Status.NOT_FOUND);
		}
		return p;
	}
	
	@GET
	@Path("/{id}")
	@Produces(MediaType.TEXT_HTML)
	public Person getViewById(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		if (p == null) { 
			throw new WebApplicationException("No person by that ID", Status.NOT_FOUND);
		}
		return p.render("show.mustache");
	}
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public Person getPersonForm() { 
		return (new Person()).render("form.mustache");
	}
	
	@POST
	@Path("/new")
	public Person createNewPerson(Person p) { 
		return dao.insert(p);
	}
	
	@GET
	@Path("/{id}/edit")
	@Produces(MediaType.TEXT_HTML)
	public Person getPersonEditForm(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		return p.render("form.mustache");
	}
	
	@POST
	@Path("/update")
	public Response updatePerson(Person p) { 
		int numRows = dao.update(p);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
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
	 * @param query : the search term
	 * @param role : either PRINCIPAL, or ADVISOR will search people with that role. 
	 * @return a list of people objects
	 */
	@GET
	@Path("/search")
	public List<Person> searchByName(@QueryParam("q") String query, @QueryParam("role") Role role) {
		return dao.searchByName(query, role);
	}
	
	@GET
	@Path("/search")
	@Produces(MediaType.TEXT_HTML)
	public Person getSearchPage() { 
		return (new Person()).render("search.mustache");
	}
	
	@GET
	@Path("/{id}/billet")
	public Billet getBilletForAdvisor(@PathParam("personId") int personId) { 
		return dao.getBilletForAdvisor(personId);
	}
	
	@GET
	@Path("/{id}/tashkil")
	public Tashkil getTashkilForPrincipal(@PathParam("personId") int personId) {
		return null;
//		return dao.getTashkilForPrincipal(personId);
	}
}
