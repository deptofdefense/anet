package mil.dds.anet.auth;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.SecurityContext;

import io.dropwizard.auth.Authorizer;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.Position;

public class AnetAuthenticationFilter implements ContainerRequestFilter, Authorizer<Person> {

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
				person.setName(domainUsername);
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
				public boolean isUserInRole(String role) { return authorize(user, role);}
				public boolean isSecure() { return secContext.isSecure();}
				public String getAuthenticationScheme() { return secContext.getAuthenticationScheme();}
			});
		} else { 
			throw new WebApplicationException("Unauthorized", Status.UNAUTHORIZED);
		}
	}

	@Override
	public boolean authorize(Person principal, String role) {
		Position position = principal.getPosition();
		if (position == null) { return false; }
		
		//Administrators can do anything
		if (position.getType() == PositionType.ADMINISTRATOR) { return true; } 
		
		//Verify the user is a super user. 
		if (PositionType.SUPER_USER.toString().equals(role)) { 
			if (position.getType() == PositionType.SUPER_USER) { 
				return true;
			}
		}
		return false;
	}

}
