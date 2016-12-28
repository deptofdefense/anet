package mil.dds.anet.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.search.ReportSearchQuery;

public interface IReportSearcher {

	public List<Report> runSearch(ReportSearchQuery query, Handle dbHandle);
	
}
