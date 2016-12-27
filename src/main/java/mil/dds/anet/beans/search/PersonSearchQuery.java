package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;

public class PersonSearchQuery {

	String text;
	Integer orgId;
	Role role;
	Status status;
	Boolean includeChildOrgs;
	String country;
	Integer locationId;
	Boolean pendingVerification;

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Integer getOrgId() {
		return orgId;
	}

	public void setOrgId(Integer orgId) {
		this.orgId = orgId;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Boolean getIncludeChildOrgs() {
		return includeChildOrgs;
	}

	public void setIncludeChildOrgs(Boolean includeChildOrgs) {
		this.includeChildOrgs = includeChildOrgs;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public Integer getLocationId() {
		return locationId;
	}

	public void setLocationId(Integer locationId) {
		this.locationId = locationId;
	}

	public Boolean getPendingVerification() {
		return pendingVerification;
	}

	public void setPendingVerification(Boolean pendingVerification) {
		this.pendingVerification = pendingVerification;
	}
	
}
