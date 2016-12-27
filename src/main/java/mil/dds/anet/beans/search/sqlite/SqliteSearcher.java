package mil.dds.anet.beans.search.sqlite;

import mil.dds.anet.beans.search.IPersonSearcher;
import mil.dds.anet.beans.search.IReportSearcher;
import mil.dds.anet.beans.search.ISearcher;

public class SqliteSearcher implements ISearcher {

	SqliteReportSearcher reportSearcher;
	SqlitePersonSearcher personSearcher;
	
	public SqliteSearcher() { 
		this.reportSearcher = new SqliteReportSearcher();
		this.personSearcher = new SqlitePersonSearcher();
	}
	
	@Override
	public IReportSearcher getReportSearcher() {
		return reportSearcher;
	}

	@Override
	public IPersonSearcher getPersonSearcher() {
		return personSearcher;
	}

}
