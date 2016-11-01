package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class AdvisorOrganizationMapper implements ResultSetMapper<AdvisorOrganization> {

	@Override
	public AdvisorOrganization map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		AdvisorOrganization ao = new AdvisorOrganization();
		ao.setId(r.getInt("id"));
		ao.setName(r.getString("name"));
		ao.setCreatedAt(new DateTime(r.getLong("createdAt")));
		ao.setUpdatedAt(new DateTime(r.getLong("updatedAt")));
		ao.setLoadLevel(LoadLevel.PROPERTIES);
		return ao;
	}

	
}
