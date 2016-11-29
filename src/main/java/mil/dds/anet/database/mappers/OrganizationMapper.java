package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class OrganizationMapper implements ResultSetMapper<Organization> {

	@Override
	public Organization map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Organization org = new Organization();
		org.setId(r.getInt("id"));
		org.setName(r.getString("name"));
		org.setType(MapperUtils.getEnumIdx(r, "type", OrganizationType.class));
		
		Integer parentOrgId = MapperUtils.getInteger(r, "parentOrgId");
		if (parentOrgId != null) { 
			org.setParentOrg(Organization.createWithId(parentOrgId));
		}
		
		org.setCreatedAt(new DateTime(r.getTimestamp("createdAt")));
		org.setUpdatedAt(new DateTime(r.getTimestamp("updatedAt")));
		org.setLoadLevel(LoadLevel.PROPERTIES);
		return org;
	}

	
}
