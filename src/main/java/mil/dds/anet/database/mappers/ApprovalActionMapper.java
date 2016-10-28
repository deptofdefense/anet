package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.beans.ApprovalAction.ApprovalType;
import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;

public class ApprovalActionMapper implements ResultSetMapper<ApprovalAction> {

	@Override
	public ApprovalAction map(int index, ResultSet rs, StatementContext ctx) throws SQLException {
		ApprovalAction aa = new ApprovalAction();
		aa.setPerson(Person.createWithId(rs.getInt("personId")));
		
		Report r = new Report();
		r.setId(rs.getInt("reportId"));
		aa.setReport(r);
		
		ApprovalStep step = new ApprovalStep();
		step.setId(rs.getInt("approvalStepId"));
		aa.setStep(step);
		
		aa.setCreatedAt(new DateTime(rs.getLong("createdAt")));
		aa.setType(ApprovalType.values()[rs.getInt("type")]);
//		aa.setLoadLevel(LoadLevel.PROPERTIES);
	
		return aa;
	}

}
