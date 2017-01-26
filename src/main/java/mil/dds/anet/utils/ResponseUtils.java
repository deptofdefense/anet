package mil.dds.anet.utils;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.fasterxml.jackson.databind.ObjectMapper;

public class ResponseUtils {

	private static ObjectMapper mapper = new ObjectMapper();
	
	public static Response withMsg(String msg, Status status) { 
		Map<String,Object> entity = new HashMap<String,Object>();
		entity.put("msg", msg);
		entity.put("status",status.getStatusCode());
		return Response.status(status).entity(entity).build();
	}
	
	/*
	 * Tries to convert the parameters in an httpRequest into bean. 
	 * @throws IllegalArgumentException if conversion fails.  see {ObjectMapper.convertValue}
	 */
	public static <T> T convertParamsToBean(HttpServletRequest request, Class<T> beanClazz)  throws IllegalArgumentException { 
		Map<String,String[]> paramsRaw = request.getParameterMap();
		Map<String,String> params = new HashMap<String,String>();
		for (Map.Entry<String,String[]> entry : paramsRaw.entrySet()) { 
			params.put(entry.getKey(), entry.getValue()[0]);
		}
		return mapper.convertValue(params, beanClazz);
	}
	
}
