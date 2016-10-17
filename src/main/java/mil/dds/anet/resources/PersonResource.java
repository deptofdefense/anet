package mil.dds.anet.resources;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
		return dao.getPersonById(id);
	}
	
	@POST
	@Path("/new")
	public Person createNewPerson(Person p) { 
		int id = dao.insertPerson(p);
		p.setId(id);
		return p;
	}
	
}
