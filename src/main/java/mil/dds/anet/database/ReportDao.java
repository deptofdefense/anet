package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.mappers.LocationMapper;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.database.mappers.ReportPersonMapper;
import mil.dds.anet.utils.DaoUtils;

public class ReportDao implements IAnetDao<Report> {

	Handle dbHandle;
	
	public ReportDao(Handle db) {
		this.dbHandle = db;
	}
	
	public List<Report> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT * FROM reports ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT * from reports ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Report> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new ReportMapper());
		return query.list();
	}
	
	public Report insert(Report r) {
		r.setCreatedAt(DateTime.now());
		r.setUpdatedAt(r.getCreatedAt());
		
		//MSSQL requires explicit CAST when a datetime2 might be NULL. 
		StringBuilder sql = new StringBuilder("INSERT INTO reports " + 
				"(state, createdAt, updatedAt, locationId, intent, exsum, " +
				"text, nextSteps, authorId, engagementDate, atmosphere, " + 
				"atmosphereDetails) VALUES " +
				"(:state, :createdAt, :updatedAt, :locationId, :intent, " +
				":exsum, :reportText, :nextSteps, :authorId, ");
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql.append("CAST(:engagementDate AS datetime2), ");
		} else { 
			sql.append(":engagementDate, ");
		}
		sql.append(":atmosphere, :atmosphereDetails)");
		
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(sql.toString())
			.bindFromProperties(r)
			.bind("state", DaoUtils.getEnumId(r.getState()))
			.bind("atmosphere", DaoUtils.getEnumId(r.getAtmosphere()))
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("authorId", r.getAuthor().getId())
			.executeAndReturnGeneratedKeys();
		r.setId(DaoUtils.getGeneratedId(keys));
		
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
		if (r.getPoamsJson() != null) { 
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
		
		StringBuilder sql = new StringBuilder("UPDATE reports SET " +
				"state = :state, updatedAt = :updatedAt, locationId = :locationId, " + 
				"intent = :intent, exsum = :exsum, text = :text, nextSteps = :nextSteps, " + 
				"approvalStepId = :approvalStepId, ");
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql.append("engagementDate = CAST(:engagementDate AS datetime2), ");
		} else { 
			sql.append("engagementDate = :engagementDate, ");
		}
		sql.append("atmosphere = :atmosphere, atmosphereDetails = :atmosphereDetails WHERE id = :reportId");
		
		return dbHandle.createStatement(sql.toString())
			.bindFromProperties(r)
			.bind("state", r.getState().ordinal())
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("text", r.getReportText())
			.bind("authorId", r.getAuthor().getId())
			.bind("approvalStepId", DaoUtils.getId(r.getApprovalStepJson()))
			.bind("atmosphere", DaoUtils.getEnumId(r.getAtmosphere()))
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
				+ "AND state IN (:pending, :draft) ORDER BY createdAt DESC")
			.bind("authorId", p.getId())
			.bind("pending", ReportState.PENDING_APPROVAL.ordinal())
			.bind("draft", ReportState.DRAFT.ordinal())
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
	
	public List<Poam> getPoamsForReport(Report report) {
		return dbHandle.createQuery("SELECT * FROM poams, reportPoams "
				+ "WHERE reportPoams.reportId = :reportId "
				+ "AND reportPoams.poamId = poams.id")
				.bind("reportId", report.getId())
				.map(new PoamMapper())
				.list();
	}

	public List<Report> search(String query) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT * FROM reports WHERE FREETEXT ((text, nextSteps, intent, atmosphereDetails),:query)";
		} else { 
			sql = "SELECT * FROM reports WHERE text LIKE '%' || :query || '%'";
		}
		return dbHandle.createQuery(sql)
			.bind("query", query)
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getReportsByAuthorPosition(Position position) {
		return dbHandle.createQuery("SELECT reports.* from peoplePositions "
				+ "INNER JOIN reports ON peoplePositions.personId = reports.authorId "
				+ "WHERE peoplePositions.positionId = :positionId "
				+ "AND peoplePositions.personId IS NOT NULL "
				+ "ORDER BY reports.engagementDate DESC")
			.bind("positionId", position.getId())
			.map(new ReportMapper())
			.list();
	}

	public Object getReportsAboutThisPosition(Position position) {
		return dbHandle.createQuery("SELECT reports.* from reports, peoplePositions, reportPeople "
				+ "WHERE peoplePositions.positionId = :positionId "
				+ "AND reportPeople.personId = peoplePositions.personId "
				+ "AND reports.id = reportPeople.reportId "
				+ "ORDER BY reports.engagementDate DESC")
			.bind("positionId", position.getId())
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getReportsByAuthor(Person p) {
		return dbHandle.createQuery("SELECT reports.* from reports where authorId = :personId ORDER BY engagementDate DESC")
			.bind("personId", p.getId())
			.map(new ReportMapper())
			.list();
	}

	public List<Location> getRecentLocations(Person p) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT TOP 10 locations.* FROM reports, locations "
					+ "WHERE reports.locantionid = locations.id "
					+ "AND reports.authorId = :authorId "
					+ "ORDER BY reports.createdAt DESC";
		} else {
			sql = "SELECT locations.* FROM reports, locations "
					+ "WHERE reports.locationid = locations.id "
					+ "AND reports.authorId = :authorId "
					+ "ORDER BY reports.createdAt DESC LIMIT 10";
		}
		return dbHandle.createQuery(sql)
				.bind("authorId", p.getId())
		.map(new LocationMapper())
		.list();
	}
	
}
