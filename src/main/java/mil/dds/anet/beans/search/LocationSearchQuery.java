package mil.dds.anet.beans.search;

public class LocationSearchQuery implements ISearchQuery {

	private String text;
	int pageNum;
	int pageSize;
	
	public LocationSearchQuery() { 
		this.pageNum = 0;
		this.pageSize = 10;
	}
	
	@Override
	public String getText() {
		return text;
	}
	
	@Override
	public void setText(String text) {
		this.text = text;
	}

	public static LocationSearchQuery withText(String text, int pageNum, int pageSize) {
		LocationSearchQuery query = new LocationSearchQuery();
		query.setText(text);
		query.setPageNum(pageNum);
		query.setPageSize(pageSize);
		return query;
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

}
