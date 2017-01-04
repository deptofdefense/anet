package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Position.PositionType;

public class PositionSearchQuery implements ISearchQuery {

	String text;
	Integer organizationId;
	Boolean includeChildrenOrgs;
	PositionType type;
	Boolean isFilled;
	Integer locationId;
	
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public Integer getOrganizationId() {
		return organizationId;
	}
	public void setOrganizationId(Integer orgId) {
		this.organizationId = orgId;
	}
	public Boolean getIncludeChildrenOrgs() {
		return includeChildrenOrgs;
	}
	public void setIncludeChildrenOrgs(Boolean includeChildrenOrgs) {
		this.includeChildrenOrgs = includeChildrenOrgs;
	}
	public PositionType getType() {
		return type;
	}
	public void setType(PositionType type) {
		this.type = type;
	}
	public Boolean getIsFilled() {
		return isFilled;
	}
	public void setIsFilled(Boolean isFilled) {
		this.isFilled = isFilled;
	}
	public Integer getLocationId() {
		return locationId;
	}
	public void setLocationId(Integer locationId) {
		this.locationId = locationId;
	}
	public static PositionSearchQuery withText(String text) {
		PositionSearchQuery query = new PositionSearchQuery();
		query.setText(text);
		return query;
	}
	
}
