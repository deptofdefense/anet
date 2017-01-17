package mil.dds.anet.beans.search;

import org.joda.time.DateTime;

public class ReportSearchQuery implements ISearchQuery {

	Integer authorId;
	String text;
	DateTime engagementDateStart;
	DateTime engagementDateEnd;
	DateTime createdAtStart;
	DateTime createdAtEnd;
	Integer attendeeId;
	Integer authorOrgId;
	boolean includeAuthorOrgChildren;
	Integer principalOrgId;
	boolean includePrincipalOrgChildren;
	Integer locationId;
	Integer poamId;
	int pageNum;
	int pageSize;
	
	public ReportSearchQuery() { 
		this.pageNum = 0;
		this.pageSize = 10;
	}

	public Integer getAuthorId() {
		return authorId;
	}

	public void setAuthorId(Integer authorId) {
		this.authorId = authorId;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public DateTime getEngagementDateStart() {
		return engagementDateStart;
	}

	public void setEngagementDateStart(DateTime engagementDateStart) {
		this.engagementDateStart = engagementDateStart;
	}

	public DateTime getEngagementDateEnd() {
		return engagementDateEnd;
	}

	public void setEngagementDateEnd(DateTime engagementDateEnd) {
		this.engagementDateEnd = engagementDateEnd;
	}

	public DateTime getCreatedAtStart() {
		return createdAtStart;
	}

	public void setCreatedAtStart(DateTime createdAtStart) {
		this.createdAtStart = createdAtStart;
	}

	public DateTime getCreatedAtEnd() {
		return createdAtEnd;
	}

	public void setCreatedAtEnd(DateTime createdAtEnd) {
		this.createdAtEnd = createdAtEnd;
	}

	public Integer getAttendeeId() {
		return attendeeId;
	}

	public void setAttendeeId(Integer attendeeId) {
		this.attendeeId = attendeeId;
	}

	public Integer getAuthorOrgId() {
		return authorOrgId;
	}

	public void setAuthorOrgId(Integer authorOrgId) {
		this.authorOrgId = authorOrgId;
	}

	public boolean isIncludeAuthorOrgChildren() {
		return includeAuthorOrgChildren;
	}

	public void setIncludeAuthorOrgChildren(boolean includeAuthorOrgChildren) {
		this.includeAuthorOrgChildren = includeAuthorOrgChildren;
	}

	public Integer getPrincipalOrgId() {
		return principalOrgId;
	}

	public void setPrincipalOrgId(Integer principalOrgId) {
		this.principalOrgId = principalOrgId;
	}

	public boolean isIncludePrincipalOrgChildren() {
		return includePrincipalOrgChildren;
	}

	public void setIncludePrincipalOrgChildren(boolean includePrincipalOrgChildren) {
		this.includePrincipalOrgChildren = includePrincipalOrgChildren;
	}

	public Integer getLocationId() {
		return locationId;
	}

	public void setLocationId(Integer locationId) {
		this.locationId = locationId;
	}

	public Integer getPoamId() {
		return poamId;
	}

	public void setPoamId(Integer poamId) {
		this.poamId = poamId;
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
		this.pageSize = pageSize;
	}
	
	public static ReportSearchQuery withText(String text) {
		ReportSearchQuery query = new ReportSearchQuery();
		query.setText(text);
		return query;
	}
	
}
