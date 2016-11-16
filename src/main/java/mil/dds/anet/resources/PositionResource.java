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
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.joda.time.DateTime;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.database.PositionDao;
import mil.dds.anet.views.ObjectListView;

@Path("/positions")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class PositionResource {

	PositionDao dao;
	AnetObjectEngine engine;
	
	public PositionResource(AnetObjectEngine engine) { 
		this.dao = engine.getPositionDao();
		this.engine = engine;
	}
	
	@GET
	@Path("/")
	@Produces(MediaType.TEXT_HTML)
	public ObjectListView<Position> getAllPositionsView(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new ObjectListView<Position>(dao.getAllPositions(pageNum, pageSize), Position.class);
	}
	
	@GET
	@Path("/{id}")
	@Produces({MediaType.APPLICATION_JSON, MediaType.TEXT_HTML})
	public Position getPosition(@PathParam("id") int id) {
		Position b = dao.getById(id);
		return b.render("show.ftl");
	}
	
	@GET
	@Path("/new")
	@Produces(MediaType.TEXT_HTML)
	public Position getPositionForm() { 
		Position b = (new Position());
		b.addToContext("aos", engine.getOrganizationDao().getAll(0, Integer.MAX_VALUE));
		return b.render("form.ftl");
	}
	
	@POST
	@Path("/new")
	public Position createPosition(Position b) {
		return dao.insert(b);
	}
	
	@GET
	@Path("/{id}/edit")
	@Produces(MediaType.TEXT_HTML)
	public Position getPositionEditForm(@PathParam("id") int id) { 
		Position b = dao.getById(id);
		b.addToContext("aos", engine.getOrganizationDao().getAll(0, Integer.MAX_VALUE));
		return b.render("form.ftl");
	}
	
	@POST
	@Path("/update")
	public Response updatePosition(Position b) { 
		int numRows = dao.update(b);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}
	
	@GET
	@Path("/{id}/person")
	public Person getAdvisorInPosition(@PathParam("id") int PositionId, @QueryParam("atTime") Long atTimeMillis) {
		Position b = new Position();
		b.setId(PositionId);
		
		DateTime dtg = (atTimeMillis == null) ? DateTime.now() : new DateTime(atTimeMillis);
		return dao.getPersonInPosition(b, dtg);
	}
	
	@POST
	@Path("/{id}/person")
	public Response putPersonInPosition(@PathParam("id") int positionId, Person p) {
		Position b = new Position();
		b.setId(positionId);
		dao.setPersonInPosition(p, b);
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
	public List<Position> getAssociatedTashkils(@PathParam("id") int positionId) { 
		Position b = Position.createWithId(positionId);
		
		return dao.getAssociatedPositions(b);
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
	@Path("/empty")
	public List<Position> getEmptyPositions() { 
		return dao.getEmptyPositions();
	}
}
