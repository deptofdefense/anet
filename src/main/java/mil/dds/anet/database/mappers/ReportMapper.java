package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.Atmosphere;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class ReportMapper implements ResultSetMapper<Report> {

	@Override
	public Report map(int index, ResultSet rs, StatementContext ctx) throws SQLException {
		Report r = new Report();
		r.setId(rs.getInt("reports_id"));
		
		r.setState(MapperUtils.getEnumIdx(rs, "reports_state", ReportState.class));
		r.setCreatedAt(new DateTime(rs.getTimestamp("reports_createdAt")));
		r.setUpdatedAt(new DateTime(rs.getTimestamp("reports_updatedAt")));
		
		Timestamp engagementDate = rs.getTimestamp("reports_engagementDate");
		if (engagementDate != null) { 
			r.setEngagementDate(new DateTime(engagementDate));
		}
		
		Integer locationId = MapperUtils.getInteger(rs, "reports_locationId");
		if (locationId != null) { 
			Location l = Location.createWithId(locationId);
			r.setLocation(l);
		}
		
		Integer approvalStepId = MapperUtils.getInteger(rs, "reports_approvalStepId");
		if (approvalStepId != null) { 
			r.setApprovalStep(ApprovalStep.createWithId(approvalStepId));
		}
		
		r.setIntent(rs.getString("reports_intent"));
		r.setExsum(rs.getString("reports_exsum"));
		r.setAtmosphere(MapperUtils.getEnumIdx(rs, "reports_atmosphere", Atmosphere.class));
		r.setAtmosphereDetails(rs.getString("reports_atmosphereDetails"));
		
		r.setReportText(rs.getString("reports_text"));
		r.setNextSteps(rs.getString("reports_nextSteps"));
		
		Person p = Person.createWithId((MapperUtils.getInteger(rs, "reports_authorId")));
		r.setAuthor(p);
		r.setLoadLevel(LoadLevel.PROPERTIES);
		
		return r;
	}
}
