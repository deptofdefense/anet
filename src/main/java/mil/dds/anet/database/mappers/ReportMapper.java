package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class ReportMapper implements ResultSetMapper<Report> {

	@Override
	public Report map(int index, ResultSet rs, StatementContext ctx) throws SQLException {
		Report r = new Report();
		r.setId(rs.getInt("id"));
		r.setApprovalStepId(MapperUtils.getInteger(rs, "approvalStepId"));
		r.setState(MapperUtils.getEnumIdx(rs, "state", ReportState.class));
		r.setCreatedAt(new DateTime(rs.getLong("createdAt")));
		r.setUpdatedAt(new DateTime(rs.getLong("updatedAt")));
		
		Integer locationId = MapperUtils.getInteger(rs, "locationId");
		if (locationId != null) { 
			Location l = Location.createWithId(locationId);
			r.setLocation(l);
		}
		
		r.setIntent(rs.getString("intent"));
		r.setExsum(rs.getString("exsum"));
		
		r.setReportText(rs.getString("text"));
		r.setNextSteps(rs.getString("nextSteps"));
		
		Person p = Person.createWithId((MapperUtils.getInteger(rs, "authorId")));
		r.setAuthor(p);
		r.setLoadLevel(LoadLevel.PROPERTIES);
		
		return r;
	}
}
