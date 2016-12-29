package mil.dds.anet.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.search.OrganizationSearchQuery;

public interface IOrganizationSearcher {

	public List<Organization> runSearch(OrganizationSearchQuery query, Handle dbHandle);
	
}
