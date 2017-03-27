package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Poam.PoamStatus;

public class PoamMapper implements ResultSetMapper<Poam> {

	@Override
	public Poam map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Poam p = new Poam();
		p.setId(r.getInt("id"));
		p.setLongName(r.getString("longName"));
		p.setShortName(r.getString("shortName"));
		p.setCategory(r.getString("category"));
		p.setStatus(MapperUtils.getEnumIdx(r, "status", PoamStatus.class));
		
		Integer parentPoamId = MapperUtils.getInteger(r, "parentPoamId");
		if (parentPoamId != null) { 
			p.setParentPoam(Poam.createWithId(parentPoamId));
		}
		
		Integer responsibleOrgId = MapperUtils.getInteger(r, "organizationId");
		if (responsibleOrgId != null) { 
			p.setResponsibleOrg(Organization.createWithId(responsibleOrgId));
		}
		
		p.setCreatedAt(new DateTime(r.getTimestamp("createdAt")));
		p.setUpdatedAt(new DateTime(r.getTimestamp("updatedAt")));
		
		if (MapperUtils.containsColumnNamed(r, "totalCount")) { 
			ctx.setAttribute("totalCount", r.getInt("totalCount"));
		}
		
		return p;
	}

	
}
