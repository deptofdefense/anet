package mil.dds.anet.resources;

import java.util.List;

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
import mil.dds.anet.beans.Poam;
import mil.dds.anet.database.PoamDao;

@Path("/poams")
@Produces(MediaType.APPLICATION_JSON)
public class PoamResource {

	PoamDao dao;
	
	public PoamResource(AnetObjectEngine engine) {
		this.dao = engine.getPoamDao();
	}
	
	@GET
	@Path("{id}")
	public Poam getPoamById(@PathParam("id") int id) {
		return dao.getPoamById(id);
	}
	
	@POST
	@Path("/new")
	public Poam createNewPoam(Poam p) { 
		int id = dao.insertPoam(p);
		p.setId(id);
		return p;
	}
	
	/* Updates shortName, longName, category, and parentPoamId */
	@POST
	@Path("/update")
	public Response updatePoam(Poam p) { 
		int numRows = dao.updatePoam(p);
		if (numRows == 0) { 
			throw new WebApplicationException("Couldn't process update", Status.NOT_FOUND);
		}
		return Response.ok().build();
	}
	
	@GET
	@Path("/byParentId")
	public List<Poam> getPoamsByParentId(@QueryParam("id") int parentId) { 
		return dao.getPoamsByParentId(parentId);
	}
	
	//TODO: You should never be able to delete a POAM, right?  
	
	
}
