package mil.dds.anet.resources;

import javax.annotation.security.PermitAll;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.SearchResults;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.beans.search.PoamSearchQuery;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.IGraphQLBean;
import mil.dds.anet.graphql.IGraphQLResource;
import mil.dds.anet.views.IndexView;

@Path("")
@PermitAll
public class HomeResource implements IGraphQLResource {

	AnetObjectEngine engine;
	
	public HomeResource(AnetObjectEngine engine) { 
		this.engine = engine;
	}
	
	@GET
	@Path("{path: .*}")
	@Produces(MediaType.TEXT_HTML)
	public IndexView reactIndex(@Auth Person p) {
		IndexView view = new IndexView("/views/index.ftl");
		view.setCurrentUser(p);
		
		view.setSecurityBannerText(engine.getAdminSetting(AdminSettingKeys.SECURITY_BANNER_TEXT));
		view.setSecurityBannerColor(engine.getAdminSetting(AdminSettingKeys.SECURITY_BANNER_COLOR));
		view.setMapLayers(engine.getAdminSetting(AdminSettingKeys.MAP_LAYERS));
		
		return view;
	}

	public static final String ALL_TYPES = "people,reports,positions,poams,locations,organizations";

	@GET
	@GraphQLFetcher
	@Path("/api/search")
	@Produces(MediaType.APPLICATION_JSON)
	public SearchResults search(@QueryParam("q") String query, @QueryParam("types") @DefaultValue(ALL_TYPES) String types) {
		types = types.toLowerCase();

		SearchResults results = new SearchResults();

		if (types.contains("people")) {
			results.setPeople(engine.getPersonDao().search(PersonSearchQuery.withText(query)));
		}
		if (types.contains("reports")) {
			results.setReports(engine.getReportDao().search(ReportSearchQuery.withText(query)));
		}
		if (types.contains("positions")) {
			results.setPositions(engine.getPositionDao().search(PositionSearchQuery.withText(query)));
		}
		if (types.contains("poams")) {
			results.setPoams(engine.getPoamDao().search(PoamSearchQuery.withText(query)));
		}
		if (types.contains("locations")) {
			results.setLocations(engine.getLocationDao().search(LocationSearchQuery.withText(query)));
		}
		if (types.contains("organizations")) { 
			results.setOrganizations(engine.getOrganizationDao().search(OrganizationSearchQuery.withText(query)));
		}

		return results;
	}

	@Override
	public String getDescription() { return "Search"; } 

	@Override
	public Class<? extends IGraphQLBean> getBeanClass() {
		return SearchResults.class;
	}
}
