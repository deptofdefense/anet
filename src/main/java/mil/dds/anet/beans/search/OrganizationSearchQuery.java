package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Organization.OrganizationType;

public class OrganizationSearchQuery implements ISearchQuery {

	String text;
	OrganizationType type;
	
	//Search for organizations with a specific parent Org. 
	Integer parentOrgId;
	//Include descedants recursively from the specified parent. 
	//If true will include all orgs in the tree of the parentOrg
	// Including the parent Org. 
	Boolean parentOrgRecursively;
	
	int pageNum;
	int pageSize;
	
	public OrganizationSearchQuery() { 
		this.pageNum = 0;
		this.pageSize = 10;
	}
	
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
	
	public Integer getParentOrgId() {
		return parentOrgId;
	}

	public void setParentOrgId(Integer parentOrgId) {
		this.parentOrgId = parentOrgId;
	}

	public Boolean getParentOrgRecursively() {
		return parentOrgRecursively;
	}

	public void setParentOrgRecursively(Boolean parentOrgRecursively) {
		this.parentOrgRecursively = parentOrgRecursively;
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
	
	public static OrganizationSearchQuery withText(String text, int pageNum, int pageSize) {
		OrganizationSearchQuery query = new OrganizationSearchQuery();
		query.setText(text);
		query.setPageNum(pageNum);
		query.setPageSize(pageSize);
		return query;
	}
	
}
