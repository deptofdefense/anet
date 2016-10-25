package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Report;
import mil.dds.anet.database.mappers.ReportMapper;

@RegisterMapper(ReportMapper.class)
public class ReportDao {

	Handle dbHandle;
	
	public ReportDao(Handle db) { 
		this.dbHandle = db;
	}
	
	public int createNewReport(Report r) { 
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(
				"INSERT INTO reports " + 
				"(state, createdAt, updatedAt, locationId, intent, exsum, " +
				"text, nextSteps, authorId) VALUES " +
				"(:state, :createdAt, :updatedAt, :locationId, :intent, " +
				":exsum, :text, :nextSteps, :authorId)")
			.bind("state", r.getState().ordinal())
			.bind("createdAt", DateTime.now())
			.bind("updatedAt", DateTime.now())
			.bind("locationId", r.getLocation().getId())
			.bind("intent", r.getIntent())
			.bind("exsum", r.getExsum())
			.bind("text", r.getReportText())
			.bind("nextSteps", r.getNextSteps())
			.bind("authorId", r.getAuthor().getId())
			.executeAndReturnGeneratedKeys();
		return (Integer) (keys.first().get("last_insert_rowid()"));
	}

	public Report getById(int id) { 
		Query<Report> query = dbHandle.createQuery("SELECT * from reports WHERE id = :id")
				.bind("id", id)
				.map(new ReportMapper());
		List<Report> results = query.list();
		if (results.size() == 0) { return null; } 
		return results.get(0);
	}
	
	public int updateReport(Report r) { 
		return dbHandle.createStatement("UPDATE reports SET " +
				"state = :state, updatedAt = :updatedAt, locationId = :locationId, " + 
				"intent = :intent, exsum = :exsum, text = :text, nextSteps = :nextSteps, " + 
				"approvalStepId = :approvalStepId, authorId = :authorId WHERE id = :reportId")
			.bind("state", r.getState().ordinal())
			.bind("updatedAt", DateTime.now())
			.bind("locationId", r.getLocation().getId())
			.bind("intent", r.getIntent())
			.bind("exsum", r.getExsum())
			.bind("text", r.getReportText())
			.bind("nextSteps", r.getNextSteps())
			.bind("authorId", r.getAuthor().getId())
			.bind("approvalStepId", r.getApprovalStepId())
			.bind("reportId", r.getId())
			.execute();
	}
}
