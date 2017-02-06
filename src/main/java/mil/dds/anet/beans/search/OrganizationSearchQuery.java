package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Organization.OrganizationType;

public class OrganizationSearchQuery implements ISearchQuery {

	String text;
	OrganizationType type;
	Integer parentOrgId;
	boolean parentOrgRecursively;
	
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

	public boolean isParentOrgRecursively() {
		return parentOrgRecursively;
	}

	public void setParentOrgRecursively(boolean parentOrgRecursively) {
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
	
	public static OrganizationSearchQuery withText(String text) {
		OrganizationSearchQuery q = new OrganizationSearchQuery();
		q.setText(text);
		return q;
	}
	
}
