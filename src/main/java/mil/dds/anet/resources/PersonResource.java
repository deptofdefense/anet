package mil.dds.anet.resources;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import mil.dds.anet.beans.Person;
import mil.dds.anet.database.PersonDao;

@Path("/people")
@Produces(MediaType.APPLICATION_JSON)
public class PersonResource {

	private PersonDao dao;
	
	public PersonResource(PersonDao dao) { 
		this.dao = dao;
	}
	
	@GET
	@Path("/{id}")
	public Person getById(@PathParam("id") int id) { 
		Person p = dao.getById(id);
		if (p == null) { 
			throw new WebApplicationException("No person by that ID", Status.NOT_FOUND);
		}
		return p;
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
	
	@DELETE
	@Path("/{id}")
	public Response deletePerson(@PathParam("id") int id) {
		//TODO: should this operation be allowed? 
		dao.deletePersonById(id);
		return Response.ok().build();
	}
}
