package mil.dds.anet.resources;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
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
		return dao.getGroupByid(id);
	}
	
	@POST
	@Path("/new")
	public Group createNewGroup(Group g) { 
		return dao.createNewGroup(g);
	}
	
	@POST
	@Path("/addMember")
	public void addMemberToGroup(@QueryParam("groupId") int groupId, @QueryParam("personId") int personId) { 
		dao.addPersonToGroup(groupId, personId);
	}
}
