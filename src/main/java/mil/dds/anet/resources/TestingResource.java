package mil.dds.anet.resources;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.eclipse.jetty.util.log.Log;
import org.eclipse.jetty.util.log.Logger;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;

@Path("/testing")
@Produces(MediaType.APPLICATION_JSON)
public class TestingResource {

	private static Logger log = Log.getLogger(TestingResource.class);
	
	public TestingResource(AnetObjectEngine engine) {}
	
	@GET
	@Path("/whoami")
	public Person whoAmI(@Auth Person me) { 
		return me;
	}
	
	
	@GET
	@Path("/headers")
	public Map<String,String> logHeaders(@Context HttpServletRequest request) {
		Map<String,String> headers = new HashMap<String,String>();
		
		Enumeration<String> headerNames = request.getHeaderNames();
		for (; headerNames.hasMoreElements(); ) {
			String name = headerNames.nextElement();
			headers.put(name, request.getHeader(name));
			log.info("Header: {}: {}", name, request.getHeader(name));
		}
		return headers;
	}
	
	
}
