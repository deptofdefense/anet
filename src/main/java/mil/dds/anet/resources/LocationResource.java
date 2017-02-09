package mil.dds.anet.resources;

import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
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

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Location;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.LocationList;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.database.LocationDao;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.utils.AnetAuditLogger;
import mil.dds.anet.utils.ResponseUtils;

@Path("/api/locations")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class LocationResource implements IGraphQLResource {

	private LocationDao dao;
	
	public LocationResource(AnetObjectEngine engine) { 
		this.dao = engine.getLocationDao();
	}
	
	@GET
	@GraphQLFetcher
	@Path("/")
	public LocationList getAll(@DefaultValue("0") @QueryParam("pageNum") int pageNum, @DefaultValue("100") @QueryParam("pageSize") int pageSize) {
		return new LocationList(dao.getAll(pageNum, pageSize));
	}
	
	@GET
	@GraphQLFetcher
	@Path("/{id}")
	public Location getById(@PathParam("id") int id) { 
		return dao.getById(id);
	}
	
	
	@POST
	@GraphQLFetcher
	@Path("/search")
	public LocationList search(@GraphQLParam("query") LocationSearchQuery query) {
		return dao.search(query);
	}
	
	@GET
	@Path("/search")
	public LocationList search(@Context HttpServletRequest request) {
		return search(ResponseUtils.convertParamsToBean(request, LocationSearchQuery.class));
	}
	
	@POST
	@Path("/new")
	@RolesAllowed("SUPER_USER")
	public Location createNewLocation(@Auth Person user, Location l) {
		if (l.getName() == null || l.getName().trim().length() == 0) { 
			throw new WebApplicationException("Location name must not be empty", Status.BAD_REQUEST);
		}
		l = dao.insert(l);
		AnetAuditLogger.log("Location {} created by {}", l, user);
		return l;
		
	}
	
	@POST
	@Path("/update")
	@RolesAllowed("SUPER_USER")
	public Response updateLocation(@Auth Person user, Location l) {
		int numRows = dao.update(l);
		AnetAuditLogger.log("Location {} updated by {}", l, user);
		return (numRows == 1) ? Response.ok().build() : Response.status(Status.NOT_FOUND).build();
	}

	@GET
	@GraphQLFetcher
	@Path("/recents")
	public LocationList recents(@Auth Person user) { 
		return new LocationList(dao.getRecentLocations(user));
	}
	
	@Override
	public String getDescription() {
		return "Locations"; 
	}

	@Override
	public Class<Location> getBeanClass() {
		return Location.class;
	}
	
	@Override
	public Class<LocationList> getBeanListClass() {
		return LocationList.class;
	}
	
}
