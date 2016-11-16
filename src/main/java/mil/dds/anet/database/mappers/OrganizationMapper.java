package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class OrganizationMapper implements ResultSetMapper<Organization> {

	@Override
	public Organization map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Organization ao = new Organization();
		ao.setId(r.getInt("id"));
		ao.setName(r.getString("name"));
		Integer parentOrgId = MapperUtils.getInteger(r, "parentOrgId");
		if (parentOrgId != null) { 
			ao.setParentOrg(Organization.createWithId(parentOrgId));
		}
		ao.setCreatedAt(new DateTime(r.getLong("createdAt")));
		ao.setUpdatedAt(new DateTime(r.getLong("updatedAt")));
		ao.setLoadLevel(LoadLevel.PROPERTIES);
		return ao;
	}

	
}
