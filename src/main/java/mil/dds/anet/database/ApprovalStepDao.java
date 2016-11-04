package mil.dds.anet.database;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.ApprovalStep;
import mil.dds.anet.database.mappers.ApprovalStepMapper;
import mil.dds.anet.utils.DaoUtils;

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
		
		as.setId((Integer)keys.first().get("last_insert_rowid()"));
		
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
			.bind("approverGroupId", (as.getApproverGroup() == null) ? null : as.getApproverGroup().getId())
			.bind("id", as.getId())
			.execute();
				
	}

	public boolean deleteStep(int id) { 
		//ensure there is nothing currently on this step
		List<Map<String, Object>> rs = dbHandle.select("SELECT count(*) AS ct FROM reports WHERE approvalStepId = ?", id);
		Map<String,Object> result = rs.get(0);
		int count = (Integer) result.get("ct");
		if (count != 0) { 
			return false;
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
	
}
