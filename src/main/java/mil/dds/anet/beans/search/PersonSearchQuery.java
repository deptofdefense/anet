package mil.dds.anet.beans.search;

import java.util.List;

import mil.dds.anet.beans.Person.PersonStatus;
import mil.dds.anet.beans.Person.Role;

public class PersonSearchQuery implements ISearchQuery {

	public enum PersonSearchSortBy { CREATED_AT, NAME, RANK }
	
	String text;
	Integer orgId;
	Role role;
	List<PersonStatus> status;
	Boolean includeChildOrgs;
	String country;
	Integer locationId;
	Boolean pendingVerification;
	PersonSearchSortBy sortBy;
	SortOrder sortOrder;
	
	int pageNum;
	int pageSize;
	
	public PersonSearchQuery() { 
		this.pageNum = 0;
		this.pageSize = 100;
	}

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

	public List<PersonStatus> getStatus() {
		return status;
	}

	public void setStatus(List<PersonStatus> status) {
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

	public PersonSearchSortBy getSortBy() {
		return sortBy;
	}

	public void setSortBy(PersonSearchSortBy sortBy) {
		this.sortBy = sortBy;
	}

	public SortOrder getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(SortOrder sortOrder) {
		this.sortOrder = sortOrder;
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
	
	public static PersonSearchQuery withText(String text, int pageNum, int pageSize) {
		PersonSearchQuery query = new PersonSearchQuery();
		query.setText(text);
		query.setPageNum(pageNum);
		query.setPageSize(pageSize);
		return query;
	}
	
}
