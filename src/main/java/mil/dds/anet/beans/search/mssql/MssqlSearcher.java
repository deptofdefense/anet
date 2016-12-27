package mil.dds.anet.beans.search.mssql;

import mil.dds.anet.beans.search.IPersonSearcher;
import mil.dds.anet.beans.search.IReportSearcher;
import mil.dds.anet.beans.search.ISearcher;

public class MssqlSearcher implements ISearcher {

	MssqlReportSearcher reportSearcher;
	MssqlPersonSearcher personSearcher;
	
	public MssqlSearcher() { 
		this.reportSearcher = new MssqlReportSearcher();
		this.personSearcher = new MssqlPersonSearcher();
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
