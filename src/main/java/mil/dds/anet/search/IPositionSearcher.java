package mil.dds.anet.search;

import java.util.List;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.search.PositionSearchQuery;

public interface IPositionSearcher {

	public List<Position> runSearch(PositionSearchQuery query, Handle dbHandle);
	
}
