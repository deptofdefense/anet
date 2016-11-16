package mil.dds.anet.resources;

import java.util.List;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;
import mil.dds.anet.views.AbstractAnetView;

@Path("")
@PermitAll
public class HomeResource {

	@GET
	@Path("")
	public HomeView index(@Auth Person p) {
		//Get a list of any reports this person wrote that need to be approved, and reports that this person can approve. 
		List<Report> myApprovals = AnetObjectEngine.getInstance().getReportDao().getReportsForMyApproval(p);
		List<Report> myPending = AnetObjectEngine.getInstance().getReportDao().getMyReportsPendingApproval(p);
		HomeView view = new HomeView();
		view.addToContext("myApprovals", myApprovals);
		view.addToContext("myPending", myPending);
		return view;
	}
	
	
	private static class HomeView extends AbstractAnetView<HomeView> {

		protected HomeView() {
			render("/views/index.ftl");
		} 
		
	}
}
