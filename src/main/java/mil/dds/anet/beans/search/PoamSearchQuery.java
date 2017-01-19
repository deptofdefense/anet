package mil.dds.anet.beans.search;

public class PoamSearchQuery implements ISearchQuery {

	String text;
	Integer responsibleOrgId;
	String category;
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
	
	public static PoamSearchQuery withText(String text) {
		PoamSearchQuery q = new PoamSearchQuery();
		q.setText(text);
		return q;
	}

}
