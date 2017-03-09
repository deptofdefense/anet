package mil.dds.anet.emails;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.search.ReportSearchQuery;

public class DailyRollupEmail extends AnetEmailAction {

	public static DateTimeFormatter dtf = DateTimeFormat.forPattern("dd MMM YYYY");
	public static String SHOW_REPORT_TEXT_FLAG = "showReportText";
	
	DateTime startDate;
	DateTime endDate;
	String comment;
	
	public DailyRollupEmail() { 
		templateName = "/emails/rollup_simple.ftl";
	}
	
	@Override
	public String getSubject() {
		return "Daily Rollup for " + dtf.print(endDate.toDateTime(DateTimeZone.forTimeZone(TimeZone.getDefault())));
	}
	
	@Override
	public Map<String, Object> execute() {
		ReportSearchQuery query = new ReportSearchQuery();
		query.setPageSize(Integer.MAX_VALUE);
		query.setReleasedAtStart(startDate);
		query.setReleasedAtEnd(endDate);

		List<Report> reports = AnetObjectEngine.getInstance().getReportDao().search(query).getList();
		Map<String,Object> context = new HashMap<String,Object>();
		context.put("reports", reports);
		context.put("title", getSubject());
		context.put(SHOW_REPORT_TEXT_FLAG, false);
		return context;
	}

	public DateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(DateTime startDate) {
		this.startDate = startDate;
	}

	public DateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(DateTime endDate) {
		this.endDate = endDate;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	
}
