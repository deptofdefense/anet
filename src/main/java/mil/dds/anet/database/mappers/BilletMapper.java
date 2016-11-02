package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class BilletMapper implements ResultSetMapper<Billet> {

	@Override
	public Billet map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		//This hits when we do a join but there's no Billet record. 
		if (r.getObject("id") == null) { return null; }
				
		Billet b = new Billet();
		b.setId(r.getInt("id"));
		b.setName(r.getString("name"));
		b.setAdvisorOrganization(AdvisorOrganization.createWithId(r.getInt("advisorOrganizationId")));
		b.setCreatedAt(new DateTime(r.getLong("createdAt")));
		b.setLoadLevel(LoadLevel.PROPERTIES);
		return b;
	}

}
