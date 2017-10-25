package mil.dds.anet.auth;

import java.io.IOException;
import java.lang.invoke.MethodHandles;
import java.security.Principal;
import java.util.List;

import javax.annotation.Priority;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.SecurityContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dropwizard.auth.Authorizer;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.PersonStatus;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;

@Priority(1500) //Run After Authentication, but before Authorization
public class AnetAuthenticationFilter implements ContainerRequestFilter, Authorizer<Person> {

	private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

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
			List<Person> matches = engine.getPersonDao().findByDomainUsername(domainUsername);
			Person person;
			if (matches.size() == 0) { 
				//First time this user has ever logged in. 
				person = new Person();
				person.setDomainUsername(domainUsername);
				person.setName("");
				person.setRole(Role.ADVISOR);
				person.setStatus(PersonStatus.NEW_USER);
				person = engine.getPersonDao().insert(person);
			} else { 
				person = matches.get(0);
			}
			
			final Person user = person;
			ctx.setSecurityContext(new SecurityContext() {
				public Principal getUserPrincipal() {
					return user;
				}
				
				public boolean isUserInRole(String role) {
					return authorize(user, role);
				}
				
				public boolean isSecure() {
					return secContext.isSecure();
				}
				
				public String getAuthenticationScheme() {
					return secContext.getAuthenticationScheme();
				}
			});
		} else { 
			throw new WebApplicationException("Unauthorized", Status.UNAUTHORIZED);
		}
	}

	@Override
	public boolean authorize(Person principal, String role) {
		return checkAuthorization(principal, role);
	}
	
	/**
	 * Determines if a given person has a particular role. 
	 * For SUPER_USER Privileges, this does not validate that the user has
	 * those privileges for a particular organization. That needs to be done later. 
	 */
	public static boolean checkAuthorization(Person principal, String role) { 
		Position position = principal.loadPosition();
		if (position == null) {
			logger.debug("Authorizing {} for role {} FAILED due to null position", principal.getDomainUsername(), role);
			return false; 
		}
		
		//Administrators can do anything
		if (position.getType() == PositionType.ADMINISTRATOR) {
			logger.debug("Authorizing {} for role {} SUCCESS", principal.getDomainUsername(), role);
			return true; 
		} 
		
		//Verify the user is a super user. 
		if (PositionType.SUPER_USER.toString().equals(role)) { 
			if (position.getType() == PositionType.SUPER_USER) { 
				logger.debug("Authorizing {} for role {} SUCCESS", principal.getDomainUsername(), role);
				return true;
			}
		}
		logger.debug("Authorizing {} for role {} FAILED", principal.getDomainUsername(), role);
		return false;
	}

}
