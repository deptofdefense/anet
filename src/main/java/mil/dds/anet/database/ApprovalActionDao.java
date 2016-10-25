package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.database.mappers.ApprovalActionMapper;

public class ApprovalActionDao {

	Handle dbHandle;
	
	public ApprovalActionDao(Handle db) { 
		this.dbHandle = db;
	}
	
	public int createAction(ApprovalAction action) { 
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(
				"INSERT INTO approvalActions (approvalStepId, personId, reportId, createdAt, type) " + 
				"VALUES (:approvalStepId, :personId, :reportId, :createdAt, :type)")
			.bind("approvalStepId", action.getStep().getId())
			.bind("personId", action.getPerson().getId())
			.bind("reportId", action.getReport().getId())
			.bind("createdAt", DateTime.now())
			.bind("type", action.getType().ordinal())
			.executeAndReturnGeneratedKeys();
		return (Integer) (keys.first().get("last_insert_rowid()"));
	}

	public List<ApprovalAction> getActionsForReport(int reportId) {
		Query<ApprovalAction> query = dbHandle.createQuery("SELECT * FROM approvalActions " + 
				"WHERE reportId = :reportId")
			.bind("reportId", reportId)
			.map(new ApprovalActionMapper());
		return query.list();
	}
}
