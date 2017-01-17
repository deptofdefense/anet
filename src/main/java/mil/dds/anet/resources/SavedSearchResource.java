package mil.dds.anet.resources;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.SavedSearch;
import mil.dds.anet.database.SavedSearchDao;
import mil.dds.anet.graphql.IGraphQLBean;
import mil.dds.anet.graphql.IGraphQLResource;

@Path("/api/savedSearches")
@Produces(MediaType.APPLICATION_JSON)
public class SavedSearchResource implements IGraphQLResource  {

	SavedSearchDao dao;
	
	public SavedSearchResource(AnetObjectEngine engine) { 
		this.dao = engine.getSavedSearchDao();
	}
	
	@POST
	@Path("/new")
	public SavedSearch saveSearch(@Auth Person user, SavedSearch search) {
		search.setOwner(Person.createWithId(user.getId()));
		return dao.insert(search);
	}
	
	@GET
	@Path("/mine")
	public List<SavedSearch> getMySearches(@Auth Person user) { 
		return dao.getSearchesByOwner(user);
	}
	
	@Override
	public String getDescription() {
		return "Saved Searches";
	}

	@Override
	public Class<? extends IGraphQLBean> getBeanClass() {
		return SavedSearch.class;
	}
}
