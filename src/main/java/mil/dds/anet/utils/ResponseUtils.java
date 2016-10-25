package mil.dds.anet.utils;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

public class ResponseUtils {

	public static Response withMsg(String msg, Status status) { 
		Map<String,Object> entity = new HashMap<String,Object>();
		entity.put("msg", msg);
		entity.put("status",status.getStatusCode());
		return Response.status(status).entity(entity).build();
	}
	
}
