package mil.dds.anet.resources;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.views.IndexView;

@Path("")
@PermitAll
public class HomeResource{

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
	
}
