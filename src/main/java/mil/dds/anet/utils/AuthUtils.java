package mil.dds.anet.utils;

import java.util.Optional;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;

public class AuthUtils {

	public static String UNAUTH_MESSAGE = "You do not have permissions to do this";
	
	public static void assertAdministrator(Person user) { 
		if (user.loadPosition() != null &&
				user.getPosition().getType() == PositionType.ADMINISTRATOR) { 
			return;
		}
		throw new WebApplicationException(UNAUTH_MESSAGE, Status.FORBIDDEN);
	}
	
	public static boolean isSuperUserForOrg(final Person user, final Organization org) { 
		Position position = user.loadPosition();
		if (position == null) { return false; } 
		if (position.getType() == PositionType.ADMINISTRATOR) { return true; }
		if (position.getType() != PositionType.SUPER_USER) { return false; } 

		Organization loadedOrg = AnetObjectEngine.getInstance().getOrganizationDao().getById(org.getId());
		if (loadedOrg.getType() == OrganizationType.PRINCIPAL_ORG) { return true; }
		
		if (position.getOrganization() == null) { return false; }
		if (org.getId().equals(position.getOrganization().getId())) { return true; }
		
		//As a last check, load the descendant orgs. 
		Optional<Organization> orgMatch =  position.loadOrganization()
				.loadAllDescendants()
				.stream()
				.filter(o -> o.getId().equals(org.getId()))
				.findFirst();
		return orgMatch.isPresent();
	}
	
	public static void assertSuperUserForOrg(Person user, Organization org) {
		if (isSuperUserForOrg(user, org)) { return; } 
		throw new WebApplicationException(UNAUTH_MESSAGE, Status.FORBIDDEN);
	}

	public static void assertSuperUser(Person user) {
		Position position = user.loadPosition();
		if (position != null && 
			(position.getType() == PositionType.SUPER_USER ||
			position.getType() == PositionType.ADMINISTRATOR)) { 
			return;
		}
		throw new WebApplicationException(UNAUTH_MESSAGE, Status.FORBIDDEN);
	}

	public static boolean isAdmin(Person user) {
		Position position = user.loadPosition();
		return position.getType() == PositionType.ADMINISTRATOR;
	}
	
}
