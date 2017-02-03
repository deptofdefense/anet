package mil.dds.anet.search;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.LocationList;
import mil.dds.anet.beans.search.LocationSearchQuery;

public interface ILocationSearcher {

	public LocationList runSearch(LocationSearchQuery query, Handle dbHandle);
	
}
