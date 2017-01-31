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
import mil.dds.anet.beans.Position;
import mil.dds.anet.database.mappers.ApprovalStepMapper;
import mil.dds.anet.database.mappers.PositionMapper;
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
				"INSERT into approvalSteps (name, nextStepId, advisorOrganizationId) " + 
				"VALUES (:name, :nextStepId, :advisorOrganizationId)")
			.bindFromProperties(as)
			.executeAndReturnGeneratedKeys();
		
		as.setId(DaoUtils.getGeneratedId(keys));
		
		if (as.getApprovers() != null) { 
			for (Position approver : as.getApprovers()) { 
				dbHandle.createStatement("INSERT INTO approvers (positionId, approvalStepId) VALUES (:positionId, :stepId)")
					.bind("positionId", approver.getId())
					.bind("stepId", as.getId())
					.execute();
			}
		}
		
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
		return dbHandle.createStatement("UPDATE approvalSteps SET name = :name, " +
				"nextStepId = :nextStepId, advisorOrganizationId = :advisorOrganizationId " + 
				"WHERE id = :id")
			.bindFromProperties(as)
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
		
		//Remove all approvers from this step
		dbHandle.execute("DELETE FROM approvers where approvalStepId = ?", id);
		
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
	
	public List<Position> getApproversForStep(ApprovalStep as) { 
		return dbHandle.createQuery("SELECT " + PositionDao.POSITIONS_FIELDS + " FROM positions "
				+ "WHERE id IN "
				+ "(SELECT positionId from approvers where approvalStepId = :approvalStepId)")
			.bind("approvalStepId", as.getId())
			.map(new PositionMapper())
			.list();
	}

	public int addApprover(ApprovalStep step, Position position) { 
		return dbHandle.createStatement("INSERT INTO approvers (approvalStepId, positionId) VALUES (:stepId, :positionId)")
				.bind("stepId", step.getId())
				.bind("personId", position.getId())
				.execute();
	}
	
	public int removeApprover(ApprovalStep step, Position position) { 
		return dbHandle.createStatement("DELETE FROM approvers WHERE approvalStepId = :stepId AND personId = :positionId)")
				.bind("stepId", step.getId())
				.bind("personId", position.getId())
				.execute();
	}
}
