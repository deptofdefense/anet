package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
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
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.database.TashkilDao;
import mil.dds.anet.views.ObjectListView;

@Path("/tashkils")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class TashkilResource {

	TashkilDao dao;
	
	public TashkilResource(AnetObjectEngine engine) { 
		this.dao = engine.getTashkilDao();
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public ObjectListView<Tashkil> getTashkilIndex() { 
		return new ObjectListView<Tashkil>(dao.getAll(0, Integer.MAX_VALUE), Tashkil.class);
	}
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public Tashkil getTashkilForm() { 
		return new Tashkil().render("form.ftl");
	}
	
	@POST
	@Path("/new")
	public Tashkil createNewTashkil(Tashkil t) {
		return dao.insert(t);
	}
	
	@GET
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public Tashkil getById(@PathParam("id") int id) { 
		Tashkil t = dao.getById(id);
		return t.render("show.ftl");
	}
	
	@GET
	@Path("/{id}/edit")
	@Produces(MediaType.TEXT_HTML)
	public Tashkil getTashkilEditForm(@PathParam("id") int id) { 
		return dao.getById(id).render("form.ftl");
	}
	
	@POST
	@Path("/update")
	public Response updateTashkil(Tashkil t) {
		t.setUpdatedAt(DateTime.now());
		int numRows = dao.update(t);
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
	public Person getPrincipal(@QueryParam("id") int tashkilId, @QueryParam("atTime") Long atTimeMillis) {
		DateTime dtg = (atTimeMillis == null) ? DateTime.now() : new DateTime(atTimeMillis);
		
		return dao.getPrincipalInTashkil(Tashkil.createWithId(tashkilId), dtg);
	}
	
	@GET
	@Path("/empty")
	public List<Tashkil> getEmptyTashkils() { 
		return dao.getEmptyTashkils();
	}
	
}
