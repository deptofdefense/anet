package mil.dds.anet.resources;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.search.PoamSearchQuery;
import mil.dds.anet.database.PoamDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.AnetAuditLogger;
import mil.dds.anet.utils.AuthUtils;
import mil.dds.anet.utils.ResponseUtils;

@Path("/api/poams")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class PoamResource implements IGraphQLResource {

	PoamDao dao;
	
	public PoamResource(AnetObjectEngine engine) {
		this.dao = engine.getPoamDao();
	}
	
	@Override
	public Class<Poam> getBeanClass() { return Poam.class; } 
	@SuppressWarnings("rawtypes")
	public Class<List> getBeanListClass() { return List.class; } 
	
	@Override
	public String getDescription() { return "Poams"; } 
	
	@GET
	@GraphQLFetcher
	@Path("/{id}")
	public Poam getById(@PathParam("id") int id) {
		return dao.getById(id);
	}
	
	@GET
	@Path("/{id}/children")
	public List<Poam> getChildren(@PathParam("id") int id, @QueryParam("cat") String category) {
		List<Poam> p = dao.getPoamAndChildren(id);
		if (category != null) { 
			return p.stream().filter(el -> el.getCategory().equalsIgnoreCase(category))
				.collect(Collectors.toList());
		}
		return p;
	}
	
	@POST
	@Path("/new")
	@RolesAllowed("ADMINISTRATOR")
	public Poam createNewPoam(@Auth Person user, Poam p) {
		p = dao.insert(p);
		AnetAuditLogger.log("Poam {} created by {}", p, user);
		return p;
	}
	
	/* Updates shortName, longName, category, and parentPoamId */
	@POST
	@Path("/update")
	@RolesAllowed("SUPER_USER")
	public Response updatePoam(@Auth Person user, Poam p) { 
		//Admins can edit all Poams, SuperUsers can edit poams within their EF. 
		if (AuthUtils.isAdmin(user) == false) { 
			Poam existing = dao.getById(p.getId());
			AuthUtils.assertSuperUserForOrg(user, existing.getResponsibleOrg());
		}
		
		int numRows = dao.update(p);
		if (numRows == 0) { 
			throw new WebApplicationException("Couldn't process update", Status.NOT_FOUND);
		}
		AnetAuditLogger.log("Poam {} updatedby {}", p, user);
		return Response.ok().build();
	}
	
	@GET
	@Path("/byParentId")
	public List<Poam> getPoamsByParentId(@QueryParam("id") int parentId) { 
		return dao.getPoamsByParentId(parentId);
	}
	
	@GET
	@GraphQLFetcher
	@Path("/tree")
	public List<Poam> getFullPoamTree() { 
		List<Poam> poams = dao.getAll(0, Integer.MAX_VALUE);
		
		Map<Integer,Poam> poamById = new HashMap<Integer,Poam>();
		List<Poam> topPoams = new LinkedList<Poam>();
		for (Poam p : poams) {
			p.setChildrenPoams(new LinkedList<Poam>());
			poamById.put(p.getId(), p);
		}
		for (Poam p : poams) { 
			if (p.getParentPoam() != null) { 
				Poam parent = poamById.get(p.getParentPoam().getId());
				parent.getChildrenPoams().add(p);
			} else { 
				topPoams.add(p);
			}
		}
		return topPoams;		
	}
	
	@POST
	@GraphQLFetcher
	@Path("/search")
	public List<Poam> search(@GraphQLParam("query") PoamSearchQuery query ) {
		return dao.search(query);
	}
	
	@GET
	@Path("/search")
	public List<Poam> search(@Context HttpServletRequest request) {
		try { 
			return search(ResponseUtils.convertParamsToBean(request, PoamSearchQuery.class));
		} catch (IllegalArgumentException e) { 
			throw new WebApplicationException(e.getMessage(), e.getCause(), Status.BAD_REQUEST);
		}
	}
	
	@GET
	@GraphQLFetcher
	@Path("/recents")
	public List<Poam> recents(@Auth Person user) { 
		return dao.getRecentPoams(user);
	}
	
	//TODO: You should never be able to delete a POAM, right?  
	
	
	
}
