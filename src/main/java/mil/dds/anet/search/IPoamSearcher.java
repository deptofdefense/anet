package mil.dds.anet.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.search.PoamSearchQuery;

public interface IPoamSearcher {

	public List<Poam> runSearch(PoamSearchQuery query, Handle dbHandle);
	
	
}
