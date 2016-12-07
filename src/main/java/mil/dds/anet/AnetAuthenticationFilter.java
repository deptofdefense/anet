package mil.dds.anet;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.SecurityContext;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;

public class AnetAuthenticationFilter implements ContainerRequestFilter {

	AnetObjectEngine engine;
	
	public AnetAuthenticationFilter(AnetObjectEngine engine) { 
		this.engine = engine;
	}
	
	@Override
	public void filter(ContainerRequestContext ctx) throws IOException {
		final SecurityContext secContext = ctx.getSecurityContext();
		Principal p = secContext.getUserPrincipal();
		if (p != null) { 
			String domainUsername = p.getName();
			List<Person> matches = engine.getPersonDao().findByProperty("domainUsername", domainUsername);
			Person person;
			if (matches.size() == 0) { 
				//First time this user has ever logged in. 
				person = new Person();
				person.setDomainUsername(domainUsername);
				person.setRole(Role.ADVISOR);
				person.setStatus(Person.Status.ACTIVE);
				person = engine.getPersonDao().insert(person);
			} else { 
				person = matches.get(0);
			}
			
			final Person user = person;
			ctx.setSecurityContext(new SecurityContext() {
				public Principal getUserPrincipal() { return user;}
				public boolean isUserInRole(String role) { return secContext.isUserInRole(role);}
				public boolean isSecure() { return secContext.isSecure();}
				public String getAuthenticationScheme() { return secContext.getAuthenticationScheme();}
			});
		} else { 
			throw new WebApplicationException("Unauthorized", Status.UNAUTHORIZED);
		}
	}

}
