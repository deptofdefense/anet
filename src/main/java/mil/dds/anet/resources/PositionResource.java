package mil.dds.anet.resources;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
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

import org.joda.time.DateTime;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PositionList;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.database.PositionDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.AuthUtils;
import mil.dds.anet.utils.ResponseUtils;
import mil.dds.anet.utils.Utils;

@Path("/api/positions")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class PositionResource implements IGraphQLResource {

	PositionDao dao;
	AnetObjectEngine engine;
	
	public PositionResource(AnetObjectEngine engine) { 
		this.dao = engine.getPositionDao();
		this.engine = engine;
	}
	
	@Override
	public String getDescription() { return "Positions"; }

	@Override
	public Class<Position> getBeanClass() { return Position.class; }
	public Class<PositionList> getBeanListClass() { return PositionList.class; } 
	
	@GET
	@GraphQLFetcher
	@Path("/")
	public PositionList getAll(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new PositionList(pageNum, pageSize, dao.getAll(pageNum, pageSize));
	}
	
	@GET
	@Path("/{id}")
	@GraphQLFetcher
	public Position getById(@PathParam("id") int id) {
		Position p = dao.getById(id);
		if (p == null) { throw new WebApplicationException("Not Found", Status.NOT_FOUND); } 
		return p;
	}
	
	/**
	 * Creates a new position in the database. Must have Type and Organization with ID specified. 
	 * Optionally can provide: 
	 * - position.associatedPositions:  a list of Associated Positions and those relationships will be created at this point. 
	 * - position.person : If a person ID is provided in the Person object, that person will be put in this position. 
	 * @param position
	 * @return the same Position object with the ID field filled in. 
	 */
	@POST
	@Path("/new")
	@RolesAllowed("SUPER_USER")
	public Position createPosition(@Auth Person user, Position p) {
		if (p.getName() == null || p.getName().trim().length() == 0) { 
			throw new WebApplicationException("Position Name must not be null", Status.BAD_REQUEST);
		}
		if (p.getType() == null) { throw new WebApplicationException("Position type must be defined", Status.BAD_REQUEST); }
		if (p.getOrganization() == null) { throw new WebApplicationException("A Position must belong to an organization", Status.BAD_REQUEST); } 
		
		AuthUtils.assertSuperUserForOrg(user, p.getOrganization());
		
		Position created = dao.insert(p);
		
		if (p.getPerson() != null) { 
			//Put the person in the position now. 
			dao.setPersonInPosition(p.getPerson(), p);
		}
		
		if (p.getAssociatedPositions() != null && p.getAssociatedPositions().size() > 0) { 
			//Create the associations now
			for (Position associated : p.getAssociatedPositions()) { 
				dao.associatePosition(created, associated);
			}
		}
		
		return created;
	}
	
	@POST
	@Path("/update")
	@RolesAllowed("SUPER_USER")
	public Response updatePosition(@Auth Person user, Position pos) {
		AuthUtils.assertSuperUserForOrg(user, pos.getOrganization());
		int numRows = dao.update(pos);
		
		if (pos.getPerson() != null || pos.getAssociatedPositions() != null) { 
			//Run the diff and see if anything changed and update. 
			
			Position current = dao.getById(pos.getId());
			if (pos.getPerson() != null && Utils.idEqual(pos.getPerson(), current.getPerson()) == false) { 
				dao.setPersonInPosition(pos.getPerson(), pos);
			}

			if (pos.getAssociatedPositions() != null) { 
				Utils.addRemoveElementsById(current.loadAssociatedPositions(), pos.getAssociatedPositions(), 
						newPosition -> dao.associatePosition(newPosition, pos), 
						oldPositionId -> dao.deletePositionAssociation(pos, Position.createWithId(oldPositionId)));
			}	
		}
		
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	@GET
	@Path("/{id}/person")
	public Person getAdvisorInPosition(@PathParam("id") int positionId, @QueryParam("atTime") Long atTimeMillis) {
		Position p = Position.createWithId(positionId);
		
		DateTime dtg = (atTimeMillis == null) ? DateTime.now() : new DateTime(atTimeMillis);
		return dao.getPersonInPosition(p, dtg);
	}
	
	@POST
	@Path("/{id}/person")
	@RolesAllowed("SUPER_USER")
	public Response putPersonInPosition(@Auth Person user, @PathParam("id") int positionId, Person p) {
		Position pos = engine.getPositionDao().getById(positionId);
		AuthUtils.assertSuperUserForOrg(user, pos.getOrganization());
		
		dao.setPersonInPosition(p, pos);
		return Response.ok().build();
	}
	
	@DELETE
	@Path("/{id}/person")
	public Response deletePersonFromPosition(@PathParam("id") int id) {
		dao.removePersonFromPosition(Position.createWithId(id));
		return Response.ok().build();
	}
	
	@GET
	@Path("/{id}/associated")
	public PositionList getAssociatedTashkils(@PathParam("id") int positionId) { 
		Position b = Position.createWithId(positionId);
		
		return new PositionList(dao.getAssociatedPositions(b));
	}
	
	@POST
	@Path("/{id}/associated")
	public Response associateTashkil(@PathParam("id") int positionId, Position b) { 
		Position a = Position.createWithId(positionId);
		dao.associatePosition(a, b);
		return Response.ok().build();
	}
	
	@DELETE
	@Path("/{id}/associated/{positionId}")
	public Response deleteTashkilAssociation(@PathParam("id") int positionId, @PathParam("positionId") int associatedPositionId) { 
		Position a = Position.createWithId(positionId);
		Position b = Position.createWithId(associatedPositionId);
		dao.deletePositionAssociation(a, b);
		return Response.ok().build();
	}

	@GET
	@Path("/search")
	public PositionList search(@Context HttpServletRequest request) {
		try { 
			return search(ResponseUtils.convertParamsToBean(request, PositionSearchQuery.class));
		} catch (IllegalArgumentException e) { 
			throw new WebApplicationException(e.getMessage(), e.getCause(), Status.BAD_REQUEST);
		}
	}
	
	@POST
	@GraphQLFetcher
	@Path("/search")
	public PositionList search(@GraphQLParam("query") PositionSearchQuery query) {
		return new PositionList(query.getPageNum(), query.getPageSize(), dao.search(query));
	}
	
}
