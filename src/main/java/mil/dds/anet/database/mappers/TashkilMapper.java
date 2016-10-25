package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Tashkil;

public class TashkilMapper implements ResultSetMapper<Tashkil> {

	@Override
	public Tashkil map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Tashkil t = new Tashkil();
		t.setId(r.getInt("id"));
		t.setCode(r.getString("code"));
		t.setName(r.getString("name"));
		return t;
	}

}
