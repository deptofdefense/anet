package mil.dds.anet.search;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.PositionList;
import mil.dds.anet.beans.search.PositionSearchQuery;

public interface IPositionSearcher {

	public PositionList runSearch(PositionSearchQuery query, Handle dbHandle);
	
}
