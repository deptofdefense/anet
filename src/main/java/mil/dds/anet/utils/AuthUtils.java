package mil.dds.anet.utils;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;

public class AuthUtils {

	public static String UNAUTH_MESSAGE = "You do not have permissions to do this";
	
	public static void assertAdministrator(Person user) { 
		if (user.getPositionJson() != null &&
				user.getPositionJson().getType() == PositionType.ADMINISTRATOR) { 
			return;
		}
		throw new WebApplicationException(UNAUTH_MESSAGE, Status.UNAUTHORIZED);
	}
	
	public static void assertSuperUserForOrg(Person user, Organization org) {
		Position position = user.getPositionJson();
		if (position != null && 
				position.getType() == PositionType.SUPER_USER &&
				position.getOrganizationJson() != null && 
				position.getOrganizationJson().getId().equals(org.getId())) { 
			return;
		} else if (position != null && 
				position.getType() == PositionType.ADMINISTRATOR) { 
			return;
		}
		throw new WebApplicationException(UNAUTH_MESSAGE, Status.UNAUTHORIZED);
	}
	
}
