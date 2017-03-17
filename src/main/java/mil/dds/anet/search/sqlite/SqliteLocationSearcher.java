package mil.dds.anet.search.sqlite;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.LocationList;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.database.mappers.LocationMapper;
import mil.dds.anet.search.ILocationSearcher;
import mil.dds.anet.utils.Utils;

public class SqliteLocationSearcher implements ILocationSearcher {

	@Override
	public LocationList runSearch(LocationSearchQuery query, Handle dbHandle) {
		LocationList result = new LocationList();
		result.setPageNum(query.getPageNum());
		result.setPageSize(query.getPageSize());
		if (query.getText() == null || query.getText().trim().length() == 0) {
			return result;
		}
		
		result.setList(dbHandle.createQuery("/* SqliteLocationSearch */ SELECT * FROM locations "
				+ "WHERE name LIKE '%' || :name || '%' "
				+ "ORDER BY name ASC LIMIT :limit OFFSET :offset")
			.bind("name", Utils.getSqliteFullTextQuery(query.getText()))
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new LocationMapper())
			.list());
		result.setTotalCount(result.getList().size()); // Sqlite cannot do true total counts, so this is a crutch. 
		return result;
	}

}
