package mil.dds.anet.search;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.ReportList;
import mil.dds.anet.beans.search.ReportSearchQuery;

public interface IReportSearcher {

	public ReportList runSearch(ReportSearchQuery query, Handle dbHandle);
	
}
