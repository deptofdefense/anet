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
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.database.mappers.ReportPersonMapper;
import mil.dds.anet.utils.DaoUtils;

public class ReportDao implements IAnetDao<Report> {

	private static String[] fields = { "id", "state", "createdAt", "updatedAt", "engagementDate",
			"locationId", "approvalStepId", "intent", "exsum", "atmosphere",
			"atmosphereDetails", "text", "nextSteps", "authorId"};
	private static String tableName = "reports";
	public static String REPORT_FIELDS = DaoUtils.buildFieldAliases(tableName, fields);

	Handle dbHandle;

	public ReportDao(Handle db) {
		this.dbHandle = db;
	}

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

	public int removeAttendeeFromReport(Person p, Report r) {
		return dbHandle.createStatement("DELETE FROM reportPeople WHERE reportId = :reportId AND personId = :personId")
			.bind("reportId", r.getId())
			.bind("personId", p.getId())
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

	/* Returns reports that the given person can currently approve */
	public List<Report> getReportsForMyApproval(Person p) {
		return dbHandle.createQuery("SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports, groupMemberships, approvalSteps, people "
				+ "WHERE groupMemberships.personId = :personId "
				+ "AND groupMemberships.groupId = approvalSteps.approverGroupId "
				+ "AND approvalSteps.id = reports.approvalStepId "
				+ "AND reports.authorId = people.id")
			.bind("personId", p.getId())
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getMyReportsPendingApproval(Person p) {
		return dbHandle.createQuery("SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports, people "
				+ "WHERE reports.authorId = :authorId "
				+ "AND reports.state IN (:pending, :draft) "
				+ "AND reports.authorId = people.id "
				+ "ORDER BY reports.createdAt DESC")
			.bind("authorId", p.getId())
			.bind("pending", ReportState.PENDING_APPROVAL.ordinal())
			.bind("draft", ReportState.DRAFT.ordinal())
			.map(new ReportMapper())
			.list();
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

	public List<Report> search(String query) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports, people "
				+ "WHERE FREETEXT ((text, nextSteps, intent, atmosphereDetails),:query) "
				+ "AND reports.authorId = people.id";
		} else {
			sql = "SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports WHERE text LIKE '%' || :query || '%' "
				+ "AND reports.authorId = people.id";
		}
		return dbHandle.createQuery(sql)
			.bind("query", query)
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getReportsByAuthorPosition(Position position) {
		return dbHandle.createQuery("SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM peoplePositions "
				+ "INNER JOIN reports ON peoplePositions.personId = reports.authorId "
				+ "LEFT JOIN people on reports.authorId = people.id "
				+ "WHERE peoplePositions.positionId = :positionId "
				+ "AND peoplePositions.personId IS NOT NULL "
				+ "ORDER BY reports.engagementDate DESC")
			.bind("positionId", position.getId())
			.map(new ReportMapper())
			.list();
	}

	public Object getReportsAboutThisPosition(Position position) {
		return dbHandle.createQuery("SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports, peoplePositions, reportPeople, people "
				+ "WHERE peoplePositions.positionId = :positionId "
				+ "AND reportPeople.personId = peoplePositions.personId "
				+ "AND reports.id = reportPeople.reportId "
				+ "AND reports.authorId = people.id "
				+ "ORDER BY reports.engagementDate DESC")
			.bind("positionId", position.getId())
			.map(new ReportMapper())
			.list();
	}

	public List<Report> getReportsByAuthor(Person p) {
		return dbHandle.createQuery("SELECT " + REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM reports "
				+ "LEFT JOIN people WHERE reports.authorId = people.id "
				+ "WHERE authorId = :personId "
				+ "ORDER BY engagementDate DESC")
			.bind("personId", p.getId())
			.map(new ReportMapper())
			.list();
	}

	public List<Location> getRecentLocations(Person author) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT locations.* FROM locations WHERE id IN ( "
					+ "SELECT TOP(3) reports.locationId "
					+ "FROM reports "
					+ "WHERE authorid = :authorId "
					+ "GROUP BY locationId "
					+ "ORDER BY MAX(reports.createdAt) DESC"
				+ ")";
		} else {
			sql = "SELECT locations.* FROM locations WHERE id IN ( "
					+ "SELECT reports.locationId "
					+ "FROM reports "
					+ "WHERE authorid = :authorId "
					+ "GROUP BY locationId "
					+ "ORDER BY MAX(reports.createdAt) DESC LIMIT 3"
				+ ")";
		}
		return dbHandle.createQuery(sql)
				.bind("authorId", author.getId())
				.map(new LocationMapper())
				.list();
	}

	public List<Person> getRecentPeople(Person author) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT " + PersonDao.PERSON_FIELDS
				+ "FROM people WHERE people.id IN ( "
					+ "SELECT top(3) reportPeople.personId "
					+ "FROM reports JOIN reportPeople ON reports.id = reportPeople.reportId "
					+ "WHERE authorId = :authorId "
					+ "GROUP BY personId "
					+ "ORDER BY MAX(reports.createdAt) DESC"
				+ ")";
		} else {
			sql = "SELECT " + PersonDao.PERSON_FIELDS
				+ "FROM people WHERE people.id IN ( "
					+ "SELECT top(3) reportPeople.personId "
					+ "FROM reports JOIN reportPeople ON reports.id = reportPeople.reportId "
					+ "WHERE authorId = :authorId "
					+ "GROUP BY personId "
					+ "ORDER BY MAX(reports.createdAt) DESC "
					+ "LIMIT 3"
				+ ")";
		}
		return dbHandle.createQuery(sql)
				.bind("authorId", author.getId())
				.map(new PersonMapper())
				.list();
	}

	public List<Poam> getRecentPoams(Person author) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "SELECT poams.* FROM poams WHERE poams.id IN ("
					+ "SELECT TOP(3) reportPoams.poamId "
					+ "FROM reports JOIN reportPoams ON reports.id = reportPoams.reportId "
					+ "WHERE authorId = :authorId "
					+ "GROUP BY poamId "
					+ "ORDER BY MAX(reports.createdAt) DESC"
				+ ")";
		} else {
			sql =  "SELECT poams.* FROM poams WHERE poams.id IN ("
					+ "SELECT reportPoams.poamId "
					+ "FROM reports JOIN reportPoams ON reports.id = reportPoams.reportId "
					+ "WHERE authorId = :authorId "
					+ "GROUP BY poamId "
					+ "ORDER BY MAX(reports.createdAt) DESC "
					+ "LIMIT 3"
				+ ")";
		}
		return dbHandle.createQuery(sql)
				.bind("authorId", author.getId())
				.map(new PoamMapper())
				.list();
	}

}
