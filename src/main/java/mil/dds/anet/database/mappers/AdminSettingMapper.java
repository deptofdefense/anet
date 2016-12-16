package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.AdminSetting;

public class AdminSettingMapper implements ResultSetMapper<AdminSetting> {

	@Override
	public AdminSetting map(int index, ResultSet rs, StatementContext ctx) throws SQLException {
		AdminSetting as = new AdminSetting();
		as.setKey(rs.getString("key"));
		as.setValue(rs.getString("value"));
		return as;
	}

}
