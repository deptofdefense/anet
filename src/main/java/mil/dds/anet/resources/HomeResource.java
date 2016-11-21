package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;
import mil.dds.anet.views.SimpleView;

@Path("")
@PermitAll
public class HomeResource {

	@GET
	@Path("")
	public SimpleView index(@Auth Person p) {
		//Get a list of any reports this person wrote that need to be approved, and reports that this person can approve.
		List<Report> myApprovals = AnetObjectEngine.getInstance().getReportDao().getReportsForMyApproval(p);
		List<Report> myPending = AnetObjectEngine.getInstance().getReportDao().getMyReportsPendingApproval(p);
		SimpleView view = new SimpleView("/views/index.ftl");
		view.addToContext("myApprovals", myApprovals);
		view.addToContext("myPending", myPending);
		return view;
	}

	@GET
	@Path("/feature_test")
	public SimpleView featureTest() {
		return new SimpleView("/views/feature_test.ftl");
	}
}
