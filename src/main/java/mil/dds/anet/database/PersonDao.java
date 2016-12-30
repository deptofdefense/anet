package mil.dds.anet.database;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import com.google.common.base.Joiner;
import com.google.common.collect.Sets;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.database.mappers.OrganizationMapper;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.utils.DaoUtils;

public class PersonDao implements IAnetDao<Person> {

	private static String[] fields = {"id","name","status","role",
			"emailAddress","phoneNumber","rank","biography",
			"country", "gender", "endOfTourDate",
			"domainUsername","pendingVerification","createdAt",
			"updatedAt"};
	private static String tableName = "people";
	public static String PERSON_FIELDS = DaoUtils.buildFieldAliases(tableName, fields);
	
	Handle dbHandle;
	
	public PersonDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<Person> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT " + PERSON_FIELDS + " FROM people ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT " + PERSON_FIELDS + " from people ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Person> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new PersonMapper());
		return query.list();
	}

	public Person getById(int id) { 
		Query<Person> query = dbHandle.createQuery("SELECT " + PERSON_FIELDS + " FROM people WHERE id = :id")
				.bind("id",  id)
				.map(new PersonMapper());
		List<Person> rs = query.list();
		if (rs.size() == 0) { return null; } 
		return rs.get(0);
	}
	
	public Person insert(Person p){
		p.setCreatedAt(DateTime.now());
		p.setUpdatedAt(DateTime.now());
		StringBuilder sql = new StringBuilder();
		sql.append("INSERT INTO people " +
				"(name, status, role, emailAddress, phoneNumber, rank, pendingVerification, "
				+ "gender, country, endOfTourDate, biography, domainUsername, createdAt, updatedAt) " +
				"VALUES (:name, :status, :role, :emailAddress, :phoneNumber, :rank, :pendingVerification, "
				+ ":gender, :country, ");
		if (DaoUtils.isMsSql(dbHandle)) {
			//MsSql requires an explicit CAST when datetime2 might be NULL. 
			sql.append("CAST(:endOfTourDate AS datetime2), ");
		} else {
			sql.append(":endOfTourDate, ");
		}
		sql.append(":biography, :domainUsername, :createdAt, :updatedAt);");

		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(sql.toString())
			.bindFromProperties(p)
			.bind("status", DaoUtils.getEnumId(p.getStatus()))
			.bind("role", DaoUtils.getEnumId(p.getRole()))
			.executeAndReturnGeneratedKeys();
		p.setId(DaoUtils.getGeneratedId(keys));
		return p;
	}
	
	public int update(Person p){
		p.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("UPDATE people " + 
				"SET name = :name, status = :status, role = :role, " + 
				"gender = :gender, country = :country, endOfTourDate = :endOfTourDate, " + 
				"phoneNumber = :phoneNumber, rank = :rank, biography = :biography, " +
				"pendingVerification = :pendingVerification, updatedAt = :updatedAt "
				+ "WHERE id = :id")
			.bindFromProperties(p)
			.bind("status", DaoUtils.getEnumId(p.getStatus()))
			.bind("role", DaoUtils.getEnumId(p.getRole()))
			.execute();
	}
	
	public List<Person> search(PersonSearchQuery query) {
		return AnetObjectEngine.getInstance().getSearcher()
				.getPersonSearcher().runSearch(query, dbHandle);
		
	}
	
	public Organization getOrganizationForPerson(int personId) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT TOP(1) " + OrganizationDao.ORGANIZATION_FIELDS +
					"FROM organizations, positions, peoplePositions WHERE " + 
					"peoplePositions.personId = :personId AND peoplePositions.positionId = positions.id " + 
					"AND positions.organizationId = organizations.id " + 
					"ORDER BY peoplePositions.createdAt DESC";
		} else { 
			sql = "SELECT " + OrganizationDao.ORGANIZATION_FIELDS +
					"FROM organizations, positions, peoplePositions WHERE " + 
					"peoplePositions.personId = :personId AND peoplePositions.positionId = positions.id " + 
					"AND positions.organizationId = organizations.id " + 
					"ORDER BY peoplePositions.createdAt DESC LIMIT 1";
		}
		
		Query<Organization> query = dbHandle.createQuery(sql)
			.bind("personId", personId)
			.map(new OrganizationMapper());
		List<Organization> rs = query.list();
		if (rs.size() == 0) { return null; } 
		return rs.get(0);
	}

	public List<Person> findByProperty(String ...strings) {
		if (strings.length % 2 != 0 ) { throw new RuntimeException("Illegal number of arguments to findByProperty: " + strings.toString()); }
		HashSet<String> props = Sets.newHashSet("name","emailAddress","rank","phoneNumber","status", "domainUsername");
		List<String> conditions = new ArrayList<String>();
		
		for (int i=0;i<strings.length;i+=2) { 
			if (props.contains(strings[i])) { 
				conditions.add(String.format("%s.%s = ?", tableName, strings[i]));
			}
		}
		String queryString = "SELECT " + PERSON_FIELDS + "," + PositionDao.POSITIONS_FIELDS 
				+ "FROM people LEFT JOIN positions ON people.id = positions.currentPersonId "
				+ "WHERE " + Joiner.on(" AND ").join(conditions);
		Query<Map<String, Object>> query = dbHandle.createQuery(queryString);
		for (int i=0;i<strings.length;i+=2) { 
			query.bind((i/2), strings[i+1]);
		}
		return query.map(new PersonMapper()).list();
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
					+ "SELECT reportPeople.personId "
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
	
}
