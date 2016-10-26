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

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Group;
import mil.dds.anet.database.GroupDao;

@Path("/groups")
@Produces(MediaType.APPLICATION_JSON)
public class GroupResource {

	private GroupDao dao;
	
	public GroupResource(AnetObjectEngine engine) { 
		this.dao = engine.getGroupDao();
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
	
	@GET
	@Path("/{id}/addMember")
	public Response addMemberToGroup(@PathParam("id") int groupId, @QueryParam("personId") int personId) { 
		dao.addPersonToGroup(groupId, personId);
		return Response.ok().build(); //TODO: perhaps some error checking? 
	}
	
	@GET
	@Path("/{id}/removeMember")
	public Response removeMemberFromGroup(@PathParam("id") int groupId, @QueryParam("personId") int personId) { 
		dao.removePersonFromGroup(groupId, personId);
		return Response.ok().build(); //TODO: perhaps some error checking? 
	}
	
	@POST
	@Path("/rename")
	public Response renameGroup(Group g) { 
		int numRows = dao.updateGroupName(g);
		if (numRows == 1) { 
			return Response.ok().build();
		} else { 
			return Response.status(Status.NOT_FOUND).build();
		}
	}
	
	@DELETE
	@Path("/{id}")
	public Response deleteGroup(@PathParam("id") int id) { 
		int numRows = dao.deleteGroup(id);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
}
