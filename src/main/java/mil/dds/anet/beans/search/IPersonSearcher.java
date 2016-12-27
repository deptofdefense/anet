package mil.dds.anet.beans.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Person;

public interface IPersonSearcher {

	public List<Person> runSearch(PersonSearchQuery query, Handle dbHandle);
	
}
