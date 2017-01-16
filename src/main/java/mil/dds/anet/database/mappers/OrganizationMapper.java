package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.views.AbstractAnetBean.LoadLevel;

public class OrganizationMapper implements ResultSetMapper<Organization> {

	@Override
	public Organization map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Organization org = new Organization();
		org.setId(r.getInt("organizations_id"));
		org.setShortName(r.getString("organizations_shortName"));
		org.setLongName(r.getString("organizations_longName"));
		org.setType(MapperUtils.getEnumIdx(r, "organizations_type", OrganizationType.class));
		
		Integer parentOrgId = MapperUtils.getInteger(r, "organizations_parentOrgId");
		if (parentOrgId != null) { 
			org.setParentOrg(Organization.createWithId(parentOrgId));
		}
		
		org.setCreatedAt(new DateTime(r.getTimestamp("organizations_createdAt")));
		org.setUpdatedAt(new DateTime(r.getTimestamp("organizations_updatedAt")));
		org.setLoadLevel(LoadLevel.PROPERTIES);
		return org;
	}

	
}
