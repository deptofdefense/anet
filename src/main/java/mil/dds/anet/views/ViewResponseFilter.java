package mil.dds.anet.views;

import java.io.IOException;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.SecurityContext;

public class ViewResponseFilter implements ContainerResponseFilter {

	@Override
	public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
		Object entity = responseContext.getEntity();
		if (entity != null && entity instanceof AbstractAnetView<?>) { 
			AbstractAnetView<?> view = (AbstractAnetView<?>) entity;
			
			SecurityContext security = requestContext.getSecurityContext();
			if (security != null) { 
				view.addToContext("currentUser", security.getUserPrincipal());
			}
			view.addToContext("url", requestContext.getUriInfo().getPath());
		}
		
		
	}

}
