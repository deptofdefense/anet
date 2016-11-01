package mil.dds.anet.resources;

import java.util.List;

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
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.database.TashkilDao;

@Path("/tashkils")
@Produces(MediaType.APPLICATION_JSON)
public class TashkilResource {

	TashkilDao dao;
	
	public TashkilResource(AnetObjectEngine engine) { 
		this.dao = engine.getTashkilDao();
	}
	
	@POST
	@Path("/new")
	public Tashkil createNewTashkil(Tashkil t) {
		t.setCreatedAt(DateTime.now());
		t.setUpdatedAt(DateTime.now());
		int id = dao.insertTashkil(t);
		t.setId(id);
		return t;
	}
	
	@GET
	@Path("/{id}")
	public Tashkil getById(@PathParam("id") int id) { 
		Tashkil t = dao.getById(id);
		return t;
	}
	
	@POST
	@Path("/update")
	public Response updateTashkil(Tashkil t) {
		t.setUpdatedAt(DateTime.now());
		int numRows = dao.updateTashkil(t);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build(); 
	}
	
	@GET
	@Path("/byCode")
	public List<Tashkil> getByCode(@QueryParam("code") String code, @QueryParam("prefixMatch") Boolean prefixMatch) {
		if (prefixMatch) { 
			return dao.getByCodePrefix(code);
		} else { 
			return dao.getByCode(code);
		}
	}

	@POST
	@Path("/{id}/principal")
	public Response setPrincipal(@QueryParam("id") int tashkilId, Person principal) {
		dao.setPrincipal(tashkilId, principal.getId(), DateTime.now());
		return Response.ok().build(); //TODO: implement
	}
	
	@GET
	@Path("/{id}/principal")
	public Person getPrincipal(@QueryParam("id") int tashkilId) { 
		return dao.getPrincipal(tashkilId);
	}
	
}
