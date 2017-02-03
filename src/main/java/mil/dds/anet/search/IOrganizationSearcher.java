package mil.dds.anet.search;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.search.OrganizationSearchQuery;

public interface IOrganizationSearcher {

	public OrganizationList runSearch(OrganizationSearchQuery query, Handle dbHandle);
	
}
