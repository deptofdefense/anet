package mil.dds.anet.resources;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import io.dropwizard.views.View;

@Path("")
public class HomeResource {

	@GET
	@Path("")
	public HomeView index() { 
		return new HomeView();
	}
	
	
	private static class HomeView extends View {

		protected HomeView() {
			super("/views/index.mustache");
		} 
		
	}
}
