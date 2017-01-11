package mil.dds.anet.database;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.Transaction;

import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.database.mappers.ApprovalStepMapper;
import mil.dds.anet.utils.DaoUtils;
import mil.dds.anet.utils.ResponseUtils;

public class ApprovalStepDao implements IAnetDao<ApprovalStep> {

	Handle dbHandle;
	
	public ApprovalStepDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<ApprovalStep> getAll(int pageNum, int pageSize) {
		throw new UnsupportedOperationException();
	}
	
	public Collection<ApprovalStep> getByAdvisorOrganizationId(int aoId) { 
		Query<ApprovalStep> query = dbHandle.createQuery("SELECT * from approvalSteps WHERE advisorOrganizationId = :aoId")
				.bind("aoId", aoId)
				.map(new ApprovalStepMapper());
		return query.list();
	}
	
	@Override
	public ApprovalStep getById(int id) {
		Query<ApprovalStep> query = dbHandle.createQuery("SELECT * from approvalSteps where id = :id")
				.bind("id", id)
				.map(new ApprovalStepMapper());
		List<ApprovalStep> results = query.list();
		if (results.size() == 0) { return null; }
		return results.get(0);
	}
	
	@Override
	public ApprovalStep insert(ApprovalStep as) { 
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(
				"INSERT into approvalSteps (approverGroupId, nextStepId, advisorOrganizationId) " + 
				"VALUES (:approverGroupId, :nextStepId, :advisorOrganizationId)")
			.bind("approverGroupId", DaoUtils.getId(as.getApproverGroup()))
			.bind("nextStepId", as.getNextStepId())
			.bind("advisorOrganizationId", as.getAdvisorOrganizationId())
			.executeAndReturnGeneratedKeys();
		
		as.setId(DaoUtils.getGeneratedId(keys));
		return as;
	}
	
	public ApprovalStep insertAtEnd(ApprovalStep as) { 
		as = insert(as);
		
		//Add this Step to the current org list. 
		dbHandle.createStatement("UPDATE approvalSteps SET nextStepId = :id " + 
				"WHERE advisorOrganizationId = :advisorOrganizationId "
				+ "AND nextStepId IS NULL AND id != :id")
			.bindFromProperties(as)
			.execute();
		return as;
	}
	
	public int update(ApprovalStep as) { 
		return dbHandle.createStatement("UPDATE approvalSteps SET approverGroupId = :approverGroupId, " +
				"nextStepId = :nextStepId, advisorOrganizationId = :advisorOrganizationId " + 
				"WHERE id = :id")
			.bind("nextStepId", as.getNextStepId())
			.bind("advisorOrganizationId", as.getAdvisorOrganizationId())
			.bind("approverGroupId", DaoUtils.getId(as.getApproverGroup()))
			.bind("id", as.getId())
			.execute();
				
	}

	@Transaction
	public boolean deleteStep(int id) {
		//ensure there is nothing currently on this step
		List<Map<String, Object>> rs = dbHandle.select("SELECT count(*) AS ct FROM reports WHERE approvalStepId = ?", id);
		Map<String,Object> result = rs.get(0);
		int count = (Integer) result.get("ct");
		if (count != 0) { 
			throw new WebApplicationException(ResponseUtils.withMsg("Reports are currently pending at this step", Status.NOT_ACCEPTABLE));
		}

		dbHandle.begin();
		
		//fix up the linked list. 
		dbHandle.createStatement("UPDATE approvalSteps " +
				"SET nextStepId = (SELECT nextStepId from approvalSteps where id = :stepToDeleteId) " +
				"WHERE nextStepId = :stepToDeleteId")
			.bind("stepToDeleteId", id)
			.execute();
		
		dbHandle.execute("DELETE FROM approvalSteps where id = ?", id);
		dbHandle.commit();
		return true;
	}

	public ApprovalStep getStepByNextStepId(Integer id) {
		List<ApprovalStep> list = dbHandle.createQuery("SELECT * FROM approvalSteps WHERE nextStepId = :id")
			.bind("id",id)
			.map(new ApprovalStepMapper())
			.list();
		if (list.size() == 0) { return null; }
		return list.get(0);
	}
	
}
