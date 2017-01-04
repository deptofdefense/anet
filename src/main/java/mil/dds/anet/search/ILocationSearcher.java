package mil.dds.anet.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.beans.search.LocationSearchQuery;

public interface ILocationSearcher {

	public List<Location> runSearch(LocationSearchQuery query, Handle dbHandle);
	
}
