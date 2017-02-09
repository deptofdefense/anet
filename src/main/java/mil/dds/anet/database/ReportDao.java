package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.TransactionCallback;
import org.skife.jdbi.v2.TransactionStatus;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.ApprovalAction.ApprovalType;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.ReportPerson;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.ReportList;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.database.mappers.ReportPersonMapper;
import mil.dds.anet.utils.DaoUtils;

public class ReportDao implements IAnetDao<Report> {

	private static String[] fields = { "id", "state", "createdAt", "updatedAt", "engagementDate",
			"locationId", "approvalStepId", "intent", "exsum", "atmosphere", "cancelledReason",
			"advisorOrganizationId", "principalOrganizationId",
			"atmosphereDetails", "text", "keyOutcomes",
			"nextSteps", "authorId"};
	private static String tableName = "reports";
	public static String REPORT_FIELDS = DaoUtils.buildFieldAliases(tableName, fields);

	Handle dbHandle;

	public ReportDao(Handle db) {
		this.dbHandle = db;
	}

	@Override
	public List<Report> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
					+ "FROM reports, people "
					+ "WHERE reports.authorId = people.id "
					+ "ORDER BY reports.createdAt DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else {
			sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
					+ "FROM reports, people "
					+ "WHERE reports.authorId = people.id "
					+ "ORDER BY reports.createdAt DESC LIMIT :limit OFFSET :offset";
		}
		Query<Report> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new ReportMapper());
		return query.list();
	}

	@Override
	public Report insert(Report r) {
		r.setCreatedAt(DateTime.now());
		r.setUpdatedAt(r.getCreatedAt());

		//MSSQL requires explicit CAST when a datetime2 might be NULL.
		StringBuilder sql = new StringBuilder("INSERT INTO reports "
				+ "(state, createdAt, updatedAt, locationId, intent, exsum, "
				+ "text, keyOutcomes, nextSteps, authorId, "
				+ "engagementDate, atmosphere, cancelledReason, "
				+ "atmosphereDetails, advisorOrganizationId, "
				+ "principalOrganizationId) VALUES "
				+ "(:state, :createdAt, :updatedAt, :locationId, :intent, "
				+ ":exsum, :reportText, :keyOutcomes, "
				+ ":nextSteps, :authorId, ");
		if (DaoUtils.isMsSql(dbHandle)) {
			sql.append("CAST(:engagementDate AS datetime2), ");
		} else {
			sql.append(":engagementDate, ");
		}
		sql.append(":atmosphere, :cancelledReason, :atmosphereDetails, :advisorOrgId, :principalOrgId)");

		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(sql.toString())
			.bindFromProperties(r)
			.bind("state", DaoUtils.getEnumId(r.getState()))
			.bind("atmosphere", DaoUtils.getEnumId(r.getAtmosphere()))
			.bind("cancelledReason", DaoUtils.getEnumId(r.getCancelledReason()))
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("authorId", DaoUtils.getId(r.getAuthor()))
			.bind("advisorOrgId", DaoUtils.getId(r.getAdvisorOrg()))
			.bind("principalOrgId", DaoUtils.getId(r.getPrincipalOrg()))
			.executeAndReturnGeneratedKeys();
		r.setId(DaoUtils.getGeneratedId(keys));

		if (r.getAttendees() != null) {
			for (ReportPerson p : r.getAttendees()) {
				//TODO: batch this
				dbHandle.createStatement("INSERT INTO reportPeople "
						+ "(personId, reportId, isPrimary) VALUES (:personId, :reportId, :isPrimary)")
					.bind("personId", p.getId())
					.bind("reportId", r.getId())
					.bind("isPrimary", p.isPrimary())
					.execute();
			}
		}
		if (r.getPoams() != null) {
			for (Poam p : r.getPoams()) {
				//TODO: batch this.
				dbHandle.createStatement("INSERT INTO reportPoams " 
						+ "(reportId, poamId) VALUES (:reportId, :poamId)")
					.bind("reportId", r.getId())
					.bind("poamId", p.getId())
					.execute();
			}
		}
		return r;
	}

	@Override
	public Report getById(int id) {
		Query<Report> query = dbHandle.createQuery("SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports, people "
				+ "WHERE reports.id = :id "
				+ "AND reports.authorId = people.id")
				.bind("id", id)
				.map(new ReportMapper());
		List<Report> results = query.list();
		if (results.size() == 0) { return null; }
		Report r = results.get(0);
		return r;
	}

	@Override
	public int update(Report r) {
		r.setUpdatedAt(DateTime.now());

		StringBuilder sql = new StringBuilder("UPDATE reports SET "
				+ "state = :state, updatedAt = :updatedAt, locationId = :locationId, "
				+ "intent = :intent, exsum = :exsum, text = :reportText, "
				+ "keyOutcomes = :keyOutcomes, nextSteps = :nextSteps, "
				+ "approvalStepId = :approvalStepId, ");
		if (DaoUtils.isMsSql(dbHandle)) {
			sql.append("engagementDate = CAST(:engagementDate AS datetime2), ");
		} else {
			sql.append("engagementDate = :engagementDate, ");
		}
		sql.append("atmosphere = :atmosphere, atmosphereDetails = :atmosphereDetails, "
				+ "cancelledReason = :cancelledReason, " 
				+ "principalOrganizationId = :principalOrgId, advisorOrganizationId = :advisorOrgId "
				+ "WHERE id = :id");

		return dbHandle.createStatement(sql.toString())
			.bindFromProperties(r)
			.bind("state", DaoUtils.getEnumId(r.getState()))
			.bind("locationId", DaoUtils.getId(r.getLocation()))
			.bind("authorId", DaoUtils.getId(r.getAuthor()))
			.bind("approvalStepId", DaoUtils.getId(r.getApprovalStep()))
			.bind("atmosphere", DaoUtils.getEnumId(r.getAtmosphere()))
			.bind("cancelledReason", DaoUtils.getEnumId(r.getCancelledReason()))
			.bind("advisorOrgId", DaoUtils.getId(r.getAdvisorOrg()))
			.bind("principalOrgId", DaoUtils.getId(r.getPrincipalOrg()))
			.execute();
	}

	public int addAttendeeToReport(ReportPerson rp, Report r) {
		return dbHandle.createStatement("INSERT INTO reportPeople "
				+ "(personId, reportId, isPrimary) VALUES (:personId, :reportId, :isPrimary)")
			.bind("personId", rp.getId())
			.bind("reportId", r.getId())
			.bind("isPrimary", rp.isPrimary())
			.execute();
	}

	public int removeAttendeeFromReport(Person p, Report r) {
		return dbHandle.createStatement("DELETE FROM reportPeople WHERE reportId = :reportId AND personId = :personId")
			.bind("reportId", r.getId())
			.bind("personId", p.getId())
			.execute();
	}

	public int updateAttendeeOnReport(ReportPerson rp, Report r) {
		return dbHandle.createStatement("UPDATE reportPeople SET isPrimary = :isPrimary WHERE reportId = :reportId AND personId = :personId")
			.bind("reportId", r.getId())
			.bind("personId", rp.getId())
			.bind("isPrimary", rp.isPrimary())
			.execute();
	}

	public int addPoamToReport(Poam p, Report r) {
		return dbHandle.createStatement("INSERT INTO reportPoams (poamId, reportId) VALUES (:poamId, :reportId)")
			.bind("reportId", r.getId())
			.bind("poamId", p.getId())
			.execute();
	}

	public int removePoamFromReport(Poam p, Report r) {
		return dbHandle.createStatement("DELETE FROM reportPoams WHERE reportId = :reportId AND poamId = :poamId")
				.bind("reportId", r.getId())
				.bind("poamId", p.getId())
				.execute();
	}

	public List<ReportPerson> getAttendeesForReport(int reportId) {
		return dbHandle.createQuery("SELECT " + PersonDao.PERSON_FIELDS + ", reportPeople.isPrimary FROM reportPeople "
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

	public ReportList search(ReportSearchQuery query) {
		return AnetObjectEngine.getInstance().getSearcher().getReportSearcher()
			.runSearch(query, dbHandle);
	}

	public List<Report> getReportsByAuthor(Person p, int pageNum, int pageSize) {
		String sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports "
				+ "LEFT JOIN people ON reports.authorId = people.id "
				+ "WHERE authorId = :personId "
				+ "ORDER BY engagementDate DESC";
		if (DaoUtils.isMsSql(dbHandle)) {
			sql += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else {
			sql += " LIMIT :limit OFFSET :offset";
		}

		return dbHandle.createQuery(sql)
			.bind("personId", p.getId())
			.bind("limit", pageSize)
			.bind("offset", pageNum * pageSize)
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getReportsByAttendee(Person p, int pageNum, int pageSize) {
		String sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports "
				+ "JOIN reportPeople ON reports.id = reportPeople.reportId "
				+ "JOIN people ON reports.authorId = people.id "
				+ "WHERE reportPeople.personId = :personId "
				+ "ORDER BY engagementDate DESC";
		if (DaoUtils.isMsSql(dbHandle)) {
			sql += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else {
			sql += " LIMIT :limit OFFSET :offset";
		}
		return dbHandle.createQuery(sql)
			.bind("personId", p.getId())
			.bind("limit", pageSize)
			.bind("offset", pageNum * pageSize)
			.map(new ReportMapper())
			.list();
	}

	DateTimeFormatter sqlitePattern = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");


	public List<Report> getRecentReleased() {
		String sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
			+ "FROM reports "
			+ "JOIN approvalActions ON approvalActions.reportId = reports.id "
			+ "JOIN people ON reports.authorId = people.id "
			+ "WHERE approvalActions.type = :approvalType "
			+ "AND reports.state IN (:releasedState, :cancelledState) ";
		if (DaoUtils.isMsSql(dbHandle)) {
			sql +=  "AND approvalActions.createdAt > :startTime "
				+ "AND reports.engagementDate > :twoWeeksAgo ";
		} else {
			sql +=  "AND approvalActions.createdAt > :startTimeSqlite "
					+ "AND reports.engagementDate > :twoWeeksAgoSqlite ";
		}
		return dbHandle.createQuery(sql)
			.bind("approvalType", DaoUtils.getEnumId(ApprovalType.APPROVE))
			.bind("releasedState", DaoUtils.getEnumId(ReportState.RELEASED))
			.bind("cancelledState", DaoUtils.getEnumId(ReportState.CANCELLED))
			.bind("startTime", DateTime.now().minusDays(1))
			.bind("twoWeeksAgo", DateTime.now().minusDays(14))
			.bind("startTimeSqlite", sqlitePattern.print(DateTime.now().minusDays(1)))
			.bind("twoWeeksAgoSqlite", sqlitePattern.print(DateTime.now().minusDays(14)))
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getReportsByOrg(Organization org, int pageNum, int pageSize) {
		String sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
			+ "FROM reports JOIN people ON reports.authorId = people.id WHERE ";
		if (org.getType().equals(OrganizationType.ADVISOR_ORG)) {
			sql += "reports.advisorOrganizationId = :orgId ";
		} else {
			sql += "reports.principalOrganizationId = :orgId ";
		}
		sql += " ORDER BY reports.createdAt DESC ";
		if (DaoUtils.isMsSql(dbHandle)) {
			sql += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else {
			sql += " LIMIT :limit OFFSET :offset";
		}

		return dbHandle.createQuery(sql)
			.bind("orgId", DaoUtils.getId(org))
			.bind("offset", pageNum * pageSize)
			.bind("limit", pageSize)
			.map(new ReportMapper())
			.list();
	}

	/*
	 * Deletes a given report from the database. 
	 * Ensures consistency by removing all references to a report before deleting a report. 
	 */
	public void deleteReport(final Report report) {
		dbHandle.inTransaction(new TransactionCallback<Void>() {
			public Void inTransaction(Handle conn, TransactionStatus status) throws Exception {
				//Delete poams
				dbHandle.execute("DELETE FROM reportPoams where reportId = ?", report.getId());
				
				//Delete attendees
				dbHandle.execute("DELETE FROM reportPeople where reportId = ?", report.getId());
				
				//Delete comments
				dbHandle.execute("DELETE FROM comments where reportId = ?", report.getId());
				
				//Delete approvalActions
				dbHandle.execute("DELETE FROM approvalActions where reportId = ?", report.getId());
				
				//Delete report
				dbHandle.execute("DELETE FROM reports where id = ?", report.getId());
				
				return null;
			}
		});
		
	}


}
