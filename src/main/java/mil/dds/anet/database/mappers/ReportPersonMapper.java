package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.ReportPerson;

public class ReportPersonMapper implements ResultSetMapper<ReportPerson> {

	@Override
	public ReportPerson map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		ReportPerson rp = PersonMapper.fillInFields(new ReportPerson(), r);
		rp.setPrimary(r.getBoolean("isPrimary"));
		return rp;
	}

}
