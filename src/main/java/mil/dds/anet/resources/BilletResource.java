package mil.dds.anet.resources;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.joda.time.DateTime;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.BilletDao;

@Path("/billets")
@Produces(MediaType.APPLICATION_JSON)
public class BilletResource {

	BilletDao dao;
	
	public BilletResource(AnetObjectEngine engine) { 
		this.dao = engine.getBilletDao();
	}
	
	@GET
	@Path("/{id}")
	public Billet getBillet(@PathParam("id") int id) { 
		return dao.getBilletById(id);
	}
	
	@POST
	@Path("/new")
	public Billet createBillet(Billet b) {
		int id = dao.createNewBillet(b);
		b.setId(id);
		return b;
	}
	
	@POST
	@Path("/update")
	public Response updateBillet(Billet b) { 
		int numRows = dao.updateBillet(b);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	@GET
	@Path("/{id}/advisor")
	public Person getAdvisorInBillet(@PathParam("id") int billetId, @QueryParam("atTime") Long atTimeMillis) {
		Billet b = new Billet();
		b.setId(billetId);
		
		DateTime dtg = (atTimeMillis == null) ? DateTime.now() : new DateTime(atTimeMillis);
		return dao.getPersonInBillet(b, dtg);
	}
	
	@POST
	@Path("/{id}/advisor")
	public Response putAdvisorInBillet(@PathParam("id") int billetId, Person p) {
		Billet b = new Billet();
		b.setId(billetId);
		dao.setPersonInBillet(p, b);
		return Response.ok().build();
	}
	
	@DELETE
	@Path("/{id}/advisor")
	public Response deleteAdvisorFromBillet(@PathParam("id") int id) { 
		dao.removePersonFromBillet(Billet.createWithId(id));
		return Response.ok().build();
	}
}
