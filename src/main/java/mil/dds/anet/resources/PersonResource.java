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
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.views.person.PersonForm;
import mil.dds.anet.views.person.PersonListView;
import mil.dds.anet.views.person.PersonView;

@Path("/people")
@Produces(MediaType.APPLICATION_JSON)
public class PersonResource {

	private PersonDao dao;
	
	public PersonResource(AnetObjectEngine engine) { 
		this.dao = engine.getPersonDao();
	}
	
	@GET
	@Path("/")
	public List<Person> getAllPeople(@QueryParam("pageNum") int pageNum, @QueryParam("pageSize") int pageSize) {
		return dao.getAllPeople(pageNum, pageSize);
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public PersonListView getAllPeopleView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new PersonListView(dao.getAllPeople(pageNum, pageSize));
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
	public PersonView getViewById(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		if (p == null) { 
			throw new WebApplicationException("No person by that ID", Status.NOT_FOUND);
		}
		return new PersonView(p);
	}
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public PersonForm getPersonForm() { 
		return new PersonForm(null);
	}
	
	@POST
	@Path("/new")
	public Person createNewPerson(Person p) { 
		int id = dao.insertPerson(p);
		p.setId(id);
		return p;
	}
	
	@POST
	@Path("/update")
	public Response updatePerson(Person p) { 
		int numRows = dao.updatePerson(p);
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
	
	@GET
	@Path("/search")
	public List<Person> searchByName(@QueryParam("q") String query) {
		return dao.searchByName(query);
	}
}
