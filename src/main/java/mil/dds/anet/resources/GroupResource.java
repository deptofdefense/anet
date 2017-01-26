package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
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
import mil.dds.anet.beans.Group;
import mil.dds.anet.database.GroupDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.IGraphQLResource;

@Path("/api/groups")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class GroupResource implements IGraphQLResource{

	private GroupDao dao;
	
	public GroupResource(AnetObjectEngine engine) { 
		this.dao = engine.getGroupDao();
	}
	
	@Override
	public Class<Group> getBeanClass() { return Group.class; } 
	@SuppressWarnings("rawtypes")
	public Class<List> getBeanListClass() { return List.class; } 
	
	@Override
	public String getDescription() { return "Groups"; } 
	
	@GET
	@GraphQLFetcher
	@Path("/")
	public List<Group> getAll(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return dao.getAll(pageNum, pageSize);
	}
	
	@GET
	@GraphQLFetcher
	@Path("/{id}")
	public Group getById(@PathParam("id") int id) { 
		return dao.getById(id);
	}
	
	@POST
	@Path("/new")
	public Group createNewGroup(Group g) {
		if (g.getName() == null || g.getName().trim().length() == 0 ) { 
			throw new WebApplicationException("Group Name must not be empty", Status.BAD_REQUEST);
		}
		return dao.insert(g);
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
		int numRows = dao.update(g);
		if (numRows == 1) { 
			return Response.ok().build();
		} else { 
			return Response.status(Status.NOT_FOUND).build();
		}
	}
	
	@GET
	@GraphQLFetcher
	@Path("/search")
	public List<Group> search(@QueryParam("q") String query) { 
		return dao.searchGroupName(query);
	}
	
	@DELETE
	@Path("/{id}")
	public Response deleteGroup(@PathParam("id") int id) { 
		int numRows = dao.deleteGroup(id);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
}
