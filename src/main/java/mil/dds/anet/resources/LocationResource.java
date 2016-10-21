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

import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.LocationDao;

@Path("/locations")
@Produces(MediaType.APPLICATION_JSON)
public class LocationResource {

	private LocationDao dao;
	
	public LocationResource(LocationDao dao) { 
		this.dao = dao;
	}
	
	@GET
	@Path("/{id}")
	public Location getById(@PathParam("id") int id) { 
		return dao.getById(id);
	}
	
	@GET
	@Path("/search")
	public List<Location> search(@QueryParam("name") String name) {
		return dao.searchByName(name);
	}
	
	@POST
	@Path("/new")
	public Location createNewLocation(Location l) { 
		int id = dao.insertLocation(l, l.getLatLng());
		l.setId(id);
		return l;
	}
	
	@POST
	@Path("/update")
	public Response updateLocation(Location l) {
		int numRows = dao.updateLocation(l, l.getLatLng());
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
}
