package mil.dds.anet.search;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.PersonList;
import mil.dds.anet.beans.search.PersonSearchQuery;

public interface IPersonSearcher {

	public PersonList runSearch(PersonSearchQuery query, Handle dbHandle);
	
}
