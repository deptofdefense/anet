package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class TashkilMapper implements ResultSetMapper<Tashkil> {

	@Override
	public Tashkil map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		//This hits when we do a join but there's no Tashkil record. 
		if (r.getObject("id") == null) { return null; }
		
		Tashkil t = new Tashkil();
		t.setId(r.getInt("id"));
		t.setCode(r.getString("code"));
		t.setName(r.getString("name"));
		t.setCreatedAt(new DateTime(r.getLong("createdAt")));
		t.setUpdatedAt(new DateTime(r.getLong("updatedAt")));
		t.setLoadLevel(LoadLevel.PROPERTIES);
		return t;
	}

}
