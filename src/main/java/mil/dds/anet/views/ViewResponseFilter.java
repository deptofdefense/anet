package mil.dds.anet.views;

import java.io.IOException;
import java.util.List;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.SecurityContext;

import com.google.common.collect.ImmutableList;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.config.AnetConfiguration;

public class ViewResponseFilter implements ContainerResponseFilter {

	AnetConfiguration config;

	public ViewResponseFilter(AnetConfiguration config) {
		this.config = config;
	}

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

			List<Organization> topAdvisorOrgs = AnetObjectEngine.getInstance().getOrganizationDao().getByParentOrgId(null);
			view.addToContext("topAdvisorOrgs", topAdvisorOrgs);
			view.addToContext("devMode", config.isDevelopmentMode());
		}
		
		if (responseContext.getMediaType().equals(MediaType.APPLICATION_JSON_TYPE)) { 
			responseContext.getHeaders().put("Cache-Control", ImmutableList.of("no-store, no-cache, must-revalidate, post-check=0, pre-check=0"));
			responseContext.getHeaders().put("Pragma",ImmutableList.of("no-cache"));
		}


	}

}
