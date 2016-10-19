package mil.dds.anet.resources;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import mil.dds.anet.beans.Poam;

@Path("/poam")
@Produces(MediaType.APPLICATION_JSON)
public class PoamResource {

	@GET
	@Path("{id}")
	public Poam getPoamById(@PathParam("id") int id) {
		//TODO: implement
		return null;
	}
	
	@POST
	@Path("/new")
	public Poam createNewPoam(Poam p) { 
		//TODO: implement
		return null;		
	}
	
	/* Updates shortName, longName, category, and parentPoamId */
	@POST
	@Path("/update")
	public Poam updatePoam(Poam p) { 
		//TODO: implement
		return null;
	}
	
	@GET
	@Path("/byParentId")
	public List<Poam> getPoamsByParentId(@QueryParam("id") int parentId) { 
		//TODO: implement
		return null;
	}
	
	//TODO: You should never be able to delete a POAM, right?  
	
	
}
