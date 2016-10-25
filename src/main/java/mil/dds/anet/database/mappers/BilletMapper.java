package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Billet;

public class BilletMapper implements ResultSetMapper<Billet> {

	@Override
	public Billet map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Billet b = new Billet();
		b.setId(r.getInt("id"));
		b.setName(r.getString("name"));
		b.setAdvisorOrganizationId(r.getInt("advisorOrganizationId"));
		return b;
	}

}
