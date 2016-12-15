package mil.dds.anet.resources;

import javax.ws.rs.Path;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.database.AdminDao;

@Path("/api/admin")
public class AdminResource {

	private AdminDao dao;
	
	public AdminResource(AnetObjectEngine engine) { 
		this.dao = engine.getAdminDao();
	}
	
	
	
}
