package mil.dds.anet.beans.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Report;

public interface IReportSearcher {

	public List<Report> runSearch(ReportSearchQuery query, Handle dbHandle);
	
}
