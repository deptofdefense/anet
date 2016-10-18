package mil.dds.anet.resources;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import com.codahale.metrics.annotation.Timed;

import mil.dds.anet.database.TestingDao;

@Path("/testing")
@Produces(MediaType.APPLICATION_JSON)
public class TestingResource {

	private TestingDao dao;
	
	public TestingResource(TestingDao dao) {
		this.dao = dao;
	}
	
	@GET
	@Timed
	public String foobar(@QueryParam("id") int id) {
		String name = dao.findNameById(id);
		return "Hello " + name;
	}
	
	@GET
	@Path("/put")
	public String storePerson(@QueryParam("id") int id, @QueryParam("name") String name) { 
		dao.insert(id, name);
		return "Okay";
	}
	
	@GET
	@Path("/create")
	@Timed
	public void create() { 
		dao.createSomethingTable();
	}
	
	@GET
	@Path("/headers")
	public Map<String,String> logHeaders(@Context HttpServletRequest request) {
		Map<String,String> headers = new HashMap<String,String>();
		
		Enumeration<String> headerNames = request.getHeaderNames();
		for (; headerNames.hasMoreElements(); ) {
			String name = headerNames.nextElement();
			headers.put(name, request.getHeader(name));
		}
		return headers;
	}
	
	
}
