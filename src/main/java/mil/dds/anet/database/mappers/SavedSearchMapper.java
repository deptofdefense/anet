package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.SavedSearch;
import mil.dds.anet.beans.search.SavedSearch.SearchObjectType;

public class SavedSearchMapper implements ResultSetMapper<SavedSearch> {

	@Override
	public SavedSearch map(int index, ResultSet rs, StatementContext ctx) throws SQLException {
		SavedSearch ss = new SavedSearch();
		ss.setId(rs.getInt("id"));
		ss.setOwner(Person.createWithId(rs.getInt("ownerId")));
		ss.setName(rs.getString("name"));
		ss.setObjectType(MapperUtils.getEnumIdx(rs, "objectType", SearchObjectType.class));
		ss.setQuery(rs.getString("query"));
		ss.setCreatedAt(new DateTime(rs.getTimestamp("createdAt")));
		return ss;
	}

}