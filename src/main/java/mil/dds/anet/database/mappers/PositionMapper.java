package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class PositionMapper implements ResultSetMapper<Position> {

	@Override
	public Position map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		//This hits when we do a join but there's no Billet record. 
		if (r.getObject("id") == null) { return null; }
				
		Position p = new Position();
		p.setId(r.getInt("id"));
		p.setName(r.getString("name"));
		p.setCode(r.getString("code"));
		p.setType(MapperUtils.getEnumIdx(r, "type", PositionType.class));
		Integer orgId = MapperUtils.getInteger(r, "organizationId");
		if (orgId != null) { 
			p.setOrganization(Organization.createWithId(orgId));
		}
		p.setCreatedAt(new DateTime(r.getLong("createdAt")));
		p.setLoadLevel(LoadLevel.PROPERTIES);
		return p;
	}

}
