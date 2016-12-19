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
import mil.dds.anet.views.SimpleView;

@Path("")
@PermitAll
public class HomeResource {

	@GET
	@Path("{path: .*}")
	@Produces(MediaType.TEXT_HTML)
	public SimpleView reactIndex(@Auth Person p) {
		//Get a list of any reports this person wrote that need to be approved, and reports that this person can approve.
//		List<Report> myApprovals = AnetObjectEngine.getInstance().getReportDao().getReportsForMyApproval(p);
//		List<Report> myPending = AnetObjectEngine.getInstance().getReportDao().getMyReportsPendingApproval(p);
		SimpleView view = new SimpleView("/views/react.ftl");
//		view.addToContext("myApprovals", myApprovals);
//		view.addToContext("myPending", myPending);
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
			result.put("people", AnetObjectEngine.getInstance().getPersonDao().searchByName(query));
		}
		if (types.contains("reports")) {
			result.put("reports", AnetObjectEngine.getInstance().getReportDao().search(query));
		}
		if (types.contains("positions")) {
			result.put("positions", AnetObjectEngine.getInstance().getPositionDao().search(query));
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
