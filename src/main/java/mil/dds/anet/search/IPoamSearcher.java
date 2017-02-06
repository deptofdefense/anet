package mil.dds.anet.search;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.PoamList;
import mil.dds.anet.beans.search.PoamSearchQuery;

public interface IPoamSearcher {

	public PoamList runSearch(PoamSearchQuery query, Handle dbHandle);
	
	
}
