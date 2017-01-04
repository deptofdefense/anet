package mil.dds.anet.resources;

import java.util.HashMap;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.views.SimpleView;

@Path("")
@PermitAll
public class HomeResource {

	@GET
	@Path("{path: .*}")
	@Produces(MediaType.TEXT_HTML)
	public SimpleView reactIndex(@Auth Person p) {
		SimpleView view = new SimpleView("/views/index.ftl");
		view.addToContext("currentUser", p);
		return view;
	}

	public static String ALL_TYPES = "people,reports,positions,poams,locations";

	@GET
	@Path("/api/search")
	@Produces(MediaType.APPLICATION_JSON)
	public HashMap<String, Object> search(@QueryParam("q") String query, @QueryParam("types") String types) {
		if (types == null) { types = ALL_TYPES;}
		types = types.toLowerCase();

		HashMap<String, Object> result = new HashMap<String, Object>();

		if (types.contains("people")) {
			result.put("people", AnetObjectEngine.getInstance().getPersonDao().search(PersonSearchQuery.withText(query)));
		}
		if (types.contains("reports")) {
			result.put("reports", AnetObjectEngine.getInstance().getReportDao().search(ReportSearchQuery.withText(query)));
		}
		if (types.contains("positions")) {
			result.put("positions", AnetObjectEngine.getInstance().getPositionDao().search(PositionSearchQuery.withText(query)));
		}
		if (types.contains("poams")) {
			result.put("poams", AnetObjectEngine.getInstance().getPoamDao().search(query));
		}
		if (types.contains("locations")) {
			result.put("locations", AnetObjectEngine.getInstance().getLocationDao().searchByName(query));
		}

		return result;
	}
}
