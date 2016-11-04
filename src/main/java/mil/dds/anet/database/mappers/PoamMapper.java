package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Poam;

public class PoamMapper implements ResultSetMapper<Poam> {

	@Override
	public Poam map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Poam p = new Poam();
		p.setId(r.getInt("id"));
		p.setLongName(r.getString("longName"));
		p.setShortName(r.getString("shortName"));
		p.setCategory(r.getString("category"));
		
		Integer parentPoamId = MapperUtils.getInteger(r, "parentPoamId");
		if (parentPoamId != null) { 
			p.setParentPoam(Poam.createWithId(parentPoamId));
		}
		p.setCreatedAt(new DateTime(r.getLong("createdAt")));
		p.setUpdatedAt(new DateTime(r.getLong("updatedAt")));
		return p;
	}

	
}
