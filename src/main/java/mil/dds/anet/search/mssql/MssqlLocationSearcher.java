package mil.dds.anet.search.mssql;

import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.Location;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.LocationList;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.database.mappers.LocationMapper;
import mil.dds.anet.search.ILocationSearcher;

public class MssqlLocationSearcher implements ILocationSearcher {

	@Override
	public LocationList runSearch(LocationSearchQuery query, Handle dbHandle) {
		LocationList result = new LocationList();
		result.setPageNum(query.getPageNum());
		result.setPageSize(query.getPageSize());
		if (query.getText() == null || query.getText().trim().length() == 0) {
			return result;
		}
		
		Query<Location> sqlQuery = dbHandle.createQuery("SELECT *, count(*) over() as totalCount "
				+ "FROM locations WHERE CONTAINS (name, :name) "
				+ "ORDER BY createdAt DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY")
			.bind("name", "\"" + query.getText() + "*\"")
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new LocationMapper());
		
		result.setList(sqlQuery.list());
		if (result.getList().size() > 0) { 
			result.setTotalCount((Integer) sqlQuery.getContext().getAttribute("totalCount"));
		} else { 
			result.setTotalCount(0);
		}
		return result;
	}

}
