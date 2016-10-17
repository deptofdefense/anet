package mil.dds.anet.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import mil.dds.anet.beans.Group;
import mil.dds.anet.database.GroupDao;

@Path("/groups")
@Produces(MediaType.APPLICATION_JSON)
public class GroupResource {

	private GroupDao dao;
	
	public GroupResource(GroupDao dao) { 
		this.dao = dao;
	}
	
	@GET
	@Path("/{id}")
	public Group getById(@PathParam("id") int id) { 
		
	}
}
