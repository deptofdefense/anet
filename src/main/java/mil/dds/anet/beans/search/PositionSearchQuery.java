package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Position.PositionType;

public class PositionSearchQuery implements ISearchQuery {

	String text;
	Boolean matchPersonName;
	Integer organizationId;
	Boolean includeChildrenOrgs;
	PositionType type;
	Boolean isFilled;
	Integer locationId;
	int pageNum;
	int pageSize;
	
	public PositionSearchQuery() { 
		this.pageNum = 0;
		this.pageSize = 10;
		this.matchPersonName = false;
	}
	
	public String getText() {
		return text;
	}
	
	public void setText(String text) {
		this.text = text;
	}
	
	public Boolean getMatchPersonName() {
		return matchPersonName;
	}
	
	public void setMatchPersonName(Boolean matchPersonName) {
		this.matchPersonName = matchPersonName;
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
	
	@Override
	public int getPageNum() {
		return pageNum;
	}
	
	@Override
	public void setPageNum(int pageNum) {
		this.pageNum = pageNum;
	}
	
	@Override
	public int getPageSize() {
		return pageSize;
	}
	
	@Override
	public void setPageSize(int pageSize) {
		if (pageSize == 0) { return; } // that makes no sense. 
		this.pageSize = pageSize;
	}
	
	public static PositionSearchQuery withText(String text) {
		PositionSearchQuery query = new PositionSearchQuery();
		query.setText(text);
		return query;
	}
	
}
