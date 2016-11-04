package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.utils.DaoUtils;

@RegisterMapper(ReportMapper.class)
public class ReportDao implements IAnetDao<Report> {

	Handle dbHandle;
	
	public ReportDao(Handle db) { 
		this.dbHandle = db;
	}
	
	public List<Report> getAll(int pageNum, int pageSize) {
		Query<Report> query = dbHandle.createQuery("SELECT * from reports ORDER BY createdAt ASC LIMIT :limit OFFSET :offset")
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new ReportMapper());
		return query.list();
	}
	
	public Report insert(Report r) {
		r.setCreatedAt(DateTime.now());
		r.setUpdatedAt(DateTime.now());
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(
				"INSERT INTO reports " + 
				"(state, createdAt, updatedAt, locationId, intent, exsum, " +
				"text, nextSteps, authorId) VALUES " +
				"(:state, :createdAt, :updatedAt, :locationId, :intent, " +
				":exsum, :text, :nextSteps, :authorId)")
			.bind("state", r.getState().ordinal())
			.bind("createdAt", r.getCreatedAt())
			.bind("updatedAt", r.getUpdatedAt())
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("intent", r.getIntent())
			.bind("exsum", r.getExsum())
			.bind("text", r.getReportText())
			.bind("nextSteps", r.getNextSteps())
			.bind("authorId", r.getAuthor().getId())
			.executeAndReturnGeneratedKeys();
		r.setId((Integer) (keys.first().get("last_insert_rowid()")));
		
		if (r.getPrincipals() != null) { 
			for (Person p : r.getPrincipals()) { 
				//TODO: batch this
				dbHandle.createStatement("INSERT INTO reportPrincipals " + 
						"(principalId, reportId) VALUES (:principalId, :reportId)")
					.bind("principalId", p.getId())
					.bind("reportId", r.getId())
					.execute();
			}
		}
		if (r.getPoams() != null) { 
			for (Poam p : r.getPoams()) { 
				//TODO: batch this. 
				dbHandle.createStatement("INSERT INTO reportPoams " +
						"(reportId, poamId) VALUES (:reportId, :poamId)")
					.bind("reportId", r.getId())
					.bind("poamId", p.getId())
					.execute();
			}
		}
		return r;
	}

	public Report getById(int id) { 
		Query<Report> query = dbHandle.createQuery("SELECT * from reports WHERE id = :id")
				.bind("id", id)
				.map(new ReportMapper());
		List<Report> results = query.list();
		if (results.size() == 0) { return null; } 
		return results.get(0);
	}
	
	public int update(Report r) { 
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
			.bind("approvalStepId", DaoUtils.getId(r.getApprovalStepJson()))
			.bind("reportId", r.getId())
			.execute();
	}
}
