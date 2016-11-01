package mil.dds.anet.resources;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import mil.dds.anet.views.AbstractAnetView;

@Path("")
@PermitAll
public class HomeResource {

	@GET
	@Path("")
	public HomeView index() { 
		return new HomeView();
	}
	
	
	private static class HomeView extends AbstractAnetView<HomeView> {

		protected HomeView() {
			render("/views/index.ftl");
		} 
		
	}
}
