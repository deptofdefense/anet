package mil.dds.anet.search.mssql;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import com.google.common.collect.ImmutableList;

import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.database.mappers.LocationMapper;
import mil.dds.anet.search.ILocationSearcher;

public class MssqlLocationSearcher implements ILocationSearcher {

	@Override
	public List<Location> runSearch(LocationSearchQuery query, Handle dbHandle) {
		if (query.getText() == null || query.getText().trim().length() == 0) {
			return ImmutableList.of();
		}
		
		return dbHandle.createQuery("SELECT * FROM locations WHERE CONTAINS (name, :name) ORDER BY createdAt DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY")
			.bind("name", "\"" + query.getText() + "*\"")
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new LocationMapper())
			.list();
	}

}
