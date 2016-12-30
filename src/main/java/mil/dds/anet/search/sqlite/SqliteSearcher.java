package mil.dds.anet.search.sqlite;

import mil.dds.anet.search.IOrganizationSearcher;
import mil.dds.anet.search.IPersonSearcher;
import mil.dds.anet.search.IPositionSearcher;
import mil.dds.anet.search.IReportSearcher;
import mil.dds.anet.search.ISearcher;

public class SqliteSearcher implements ISearcher {

	SqliteReportSearcher reportSearcher;
	SqlitePersonSearcher personSearcher;
	SqliteOrganizationSearcher orgSearcher;
	SqlitePositionSearcher positionSearcher;
	
	public SqliteSearcher() { 
		this.reportSearcher = new SqliteReportSearcher();
		this.personSearcher = new SqlitePersonSearcher();
		this.orgSearcher = new SqliteOrganizationSearcher();
		this.positionSearcher = new SqlitePositionSearcher();
	}
	
	@Override
	public IReportSearcher getReportSearcher() {
		return reportSearcher;
	}

	@Override
	public IPersonSearcher getPersonSearcher() {
		return personSearcher;
	}

	@Override
	public IOrganizationSearcher getOrganizationSearcher() {
		return orgSearcher;
	}

	@Override
	public IPositionSearcher getPositionSearcher() {
		return positionSearcher;
	}

}
