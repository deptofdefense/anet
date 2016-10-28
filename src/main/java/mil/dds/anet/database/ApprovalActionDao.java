package mil.dds.anet.database;

import java.util.List;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.ApprovalAction;
import mil.dds.anet.database.mappers.ApprovalActionMapper;

public class ApprovalActionDao implements IAnetDao<ApprovalAction> {

	Handle dbHandle;
	
	public ApprovalActionDao(Handle db) { 
		this.dbHandle = db;
	}
	
	@Override
	public ApprovalAction insert(ApprovalAction action) {
		action.setCreatedAt(DateTime.now());
		dbHandle.createStatement("INSERT INTO approvalActions " +
				"(approvalStepId, personId, reportId, createdAt, type) " + 
				"VALUES (:approvalStepId, :personId, :reportId, :createdAt, :type)")
			.bind("approvalStepId", action.getStep().getId())
			.bind("personId", action.getPerson().getId())
			.bind("reportId", action.getReport().getId())
			.bind("createdAt", action.getCreatedAt())
			.bind("type", action.getType().ordinal())
			.execute();
		return action;
	}

	public List<ApprovalAction> getActionsForReport(int reportId) {
		Query<ApprovalAction> query = dbHandle.createQuery("SELECT * FROM approvalActions " + 
				"WHERE reportId = :reportId")
			.bind("reportId", reportId)
			.map(new ApprovalActionMapper());
		return query.list();
	}

	@Override
	public List<ApprovalAction> getAll(int pageNum, int pageSize) {
		throw new UnsupportedOperationException();
	}

	@Override
	public ApprovalAction getById(int id) {
		throw new UnsupportedOperationException();
	}

	@Override
	public int update(ApprovalAction obj) {
		throw new UnsupportedOperationException();
	}
}
