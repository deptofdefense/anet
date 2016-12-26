package mil.dds.anet.beans.search;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.tuple.Pair;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.skife.jdbi.v2.Handle;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.utils.DaoUtils;

public class ReportSearch {

	Integer authorId;
	String text;
	DateTime engagementDateStart;
	DateTime engagementDateEnd;
	Integer attendeeId;
	Integer authorOrgId;
	boolean includeAuthorOrgChildren;
	Integer principalOrgId;
	boolean includePrincipalOrgChildren;
	Integer locationId;
	Integer poamId;
	
	public Pair<String,Map<String,Object>> getQuery(Handle handle) { 
		StringBuffer sql = new StringBuffer("SELECT reports.id FROM reports ");
		Map<String,Object> args = new HashMap<String,Object>();
		List<String> whereClauses = new LinkedList<String>();
		
		if (authorId != null) { 
			whereClauses.add("reports.authorId = :authorId");
			args.put("authorId", authorId);
		}
		
		if (text != null && text.trim().length() > 0) {
			if (DaoUtils.isMsSql(handle)) {
				text = "\"" + text + "*\"";
				whereClauses.add("CONTAINS (text, :text)");
			} else {
				whereClauses.add("(text LIKE '%' || :text || '%' OR intent LIKE '%' || :text || '%')");
			}
			args.put("text", text);
		}
		
		DateTimeFormatter sqlitePattern = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");
		
		if (engagementDateStart != null) { 
			if (DaoUtils.isMsSql(handle)) {
				whereClauses.add("reports.engagementDate >= :startDate");
				args.put("startDate", engagementDateStart);	
			} else { 
				whereClauses.add("reports.engagementDate >= DateTime(:startDate)");
				args.put("startDate", sqlitePattern.print(engagementDateStart));
			}
		}
		if (engagementDateEnd != null) { 
			if (DaoUtils.isMsSql(handle)) {
				whereClauses.add("reports.engagementDate <= :endDate");
				args.put("endDate", engagementDateEnd);	
			} else { 
				whereClauses.add("reports.engagementDate <= DateTime(:endDate)");
				args.put("endDate", sqlitePattern.print(engagementDateEnd));
			}
		}
		
		if (attendeeId != null) { 
			 whereClauses.add("reports.id IN (SELECT reportId from reportPeople where personId = :attendeeId)");
			 args.put("attendeeId", attendeeId);
		}
		
		if (poamId != null) { 
			whereClauses.add("reports.id IN (SELECT reportId from reportPoams where poamId = :poamId)");
			args.put("poamId", poamId);
		}
		
		sql.append(" WHERE ");
		sql.append(Joiner.on(" AND ").join(whereClauses));
		return Pair.of(sql.toString(), args);
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
	
}
