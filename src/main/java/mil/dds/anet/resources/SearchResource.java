package mil.dds.anet.resources;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.SearchResults;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.beans.search.SavedSearch;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.IGraphQLBean;
import mil.dds.anet.graphql.IGraphQLResource;

@Path("/api/search")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
public class SearchResource implements IGraphQLResource  {

	AnetObjectEngine engine;
	
	public SearchResource(AnetObjectEngine engine) { 
		this.engine = engine;
	}
	
	@GET
	@Path("saved/{searchId}")
	@GraphQLFetcher
	public SearchResults runSavedSearch(@PathParam("searchId") int searchId, 
			@QueryParam("pageNum") @DefaultValue("0") int pageNum, 
			@QueryParam("pageSize") @DefaultValue("10") int pageSize) { 
		SavedSearch search = engine.getSavedSearchDao().getById(searchId);
		SearchResults results = new SearchResults();
		switch (search.getObjectType()) {
		case ORGANIZATIONS:
			break;
		case PEOPLE:
			break;
		case POAMS:
			break;
		case POSITIONS:
			break;
		case REPORTS:
			results.setReports(engine.getReportDao().search(ReportSearchQuery.withText(search.getQuery(), pageNum, pageSize)));
			break;
		}
		
		return results;
	}
	
	@Override
	public String getDescription() {
		return "Search";
	}

	@Override
	public Class<? extends IGraphQLBean> getBeanClass() {
		return SearchResults.class;
	}
	
	public Class<?> getBeanListClass() {
		return null;
	}
	
}
