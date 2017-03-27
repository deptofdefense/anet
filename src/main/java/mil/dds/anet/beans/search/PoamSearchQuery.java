package mil.dds.anet.beans.search;

import mil.dds.anet.beans.Poam.PoamStatus;

public class PoamSearchQuery implements ISearchQuery {

	String text;
	Integer responsibleOrgId;
	String category;
	PoamStatus status;
	int pageNum;
	int pageSize;
	
	public PoamSearchQuery() { 
		this.pageNum = 0;
		this.pageSize = 10;
	}
	
	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Integer getResponsibleOrgId() {
		return responsibleOrgId;
	}

	public void setResponsibleOrgId(Integer responsibleOrgId) {
		this.responsibleOrgId = responsibleOrgId;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public PoamStatus getStatus() {
		return status;
	}

	public void setStatus(PoamStatus status) {
		this.status = status;
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
	
	public static PoamSearchQuery withText(String text, int pageNum, int pageSize) {
		PoamSearchQuery query = new PoamSearchQuery();
		query.setText(text);
		query.setPageNum(pageNum);
		query.setPageSize(pageSize);
		return query;
	}

}
