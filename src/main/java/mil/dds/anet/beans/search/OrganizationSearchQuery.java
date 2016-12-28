package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Organization.OrganizationType;

public class OrganizationSearchQuery {

	String text;
	OrganizationType type;
	
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public OrganizationType getType() {
		return type;
	}
	public void setType(OrganizationType type) {
		this.type = type;
	}
	
}
