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
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.database.mappers.ReportPersonMapper;
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
				"text, nextSteps, authorId, engagementDate, atmosphere, " + 
				"atmosphereDetails) VALUES " +
				"(:state, :createdAt, :updatedAt, :locationId, :intent, " +
				":exsum, :text, :nextSteps, :authorId, :engagementDate, " + 
				":atmosphere, :atmosphereDetails)")
			.bindFromProperties(r)
			.bind("state", DaoUtils.getEnumId(r.getState()))
			.bind("atmosphere", DaoUtils.getEnumId(r.getAtmosphere()))
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("text", r.getReportText())
			.bind("authorId", r.getAuthor().getId())
			.executeAndReturnGeneratedKeys();
		r.setId((Integer) (keys.first().get("last_insert_rowid()")));
		
		if (r.getAttendeesJson() != null) { 
			for (ReportPerson p : r.getAttendeesJson()) { 
				//TODO: batch this
				dbHandle.createStatement("INSERT INTO reportPeople " + 
						"(personId, reportId, isPrimary) VALUES (:personId, :reportId, :isPrimary)")
					.bind("personId", p.getId())
					.bind("reportId", r.getId())
					.bind("isPrimary", p.isPrimary())
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
		Report r = results.get(0);		
		return r;
	}
	
	public int update(Report r) { 
		r.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("UPDATE reports SET " +
				"state = :state, updatedAt = :updatedAt, locationId = :locationId, " + 
				"intent = :intent, exsum = :exsum, text = :text, nextSteps = :nextSteps, " + 
				"approvalStepId = :approvalStepId, engagementDate = :engagementDate, " +
				"atmosphere = :atmosphere, atmosphereDetails = :atmosphereDetails WHERE id = :reportId")
			.bindFromProperties(r)
			.bind("state", r.getState().ordinal())
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("text", r.getReportText())
			.bind("authorId", r.getAuthor().getId())
			.bind("approvalStepId", DaoUtils.getId(r.getApprovalStepJson()))
			.bind("reportId", r.getId())
			.execute();
	}
	
	public int addAttendeeToReport(ReportPerson rp, Report r) { 
		return dbHandle.createStatement("INSERT INTO reportPeople " + 
				"(personId, reportId, isPrimary) VALUES (:personId, :reportId, :isPrimary)")
			.bind("personId", rp.getId())
			.bind("reportId", r.getId())
			.bind("isPrimary", rp.isPrimary())
			.execute();
	}
	
	public int removeAttendeeFromReport(int personId, Report r) { 
		return dbHandle.createStatement("DELETE FROM reportPeople WHERE reportId = :reportId AND personId = :personId")
			.bind("reportId", r.getId())
			.bind("personId", personId)
			.execute();
	}
	
	/* Returns reports that the given person can currently approve */
	public List<Report> getReportsForMyApproval(Person p) { 
		return dbHandle.createQuery("SELECT reports.* FROM reports, groupMemberships, approvalSteps " + 
				"WHERE groupMemberships.personId = :personId AND " + 
				"groupMemberships.groupId = approvalSteps.approverGroupId AND " + 
				"approvalSteps.id = reports.approvalStepId")
			.bind("personId", p.getId())
			.map(new ReportMapper())
			.list();
	}
	
	public List<Report> getMyReportsPendingApproval(Person p) { 
		return dbHandle.createQuery("SELECT * from reports WHERE authorId = :authorId "
				+ "AND state = :state ORDER BY createdAt DESC")
			.bind("authorId", p.getId())
			.bind("state", ReportState.PENDING_APPROVAL.ordinal())
			.map(new ReportMapper())
			.list();
	}
	
	public List<ReportPerson> getAttendeesForReport(int reportId) { 
		return dbHandle.createQuery("SELECT * FROM reportPeople "
				+ "LEFT JOIN people ON reportPeople.personId = people.id "
				+ "WHERE reportPeople.reportId = :reportId")
			.bind("reportId", reportId)
			.map(new ReportPersonMapper())
			.list();
	}

	public List<Report> search(String query) {
		return dbHandle.createQuery("SELECT * FROM reports "
				+ "WHERE text LIKE '%' || :query || '%';")
			.bind("query", query)
			.map(new ReportMapper())
			.list();
	}
	
}
