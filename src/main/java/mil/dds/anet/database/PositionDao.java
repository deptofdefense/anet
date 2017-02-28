package mil.dds.anet.database;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.TransactionCallback;
import org.skife.jdbi.v2.TransactionStatus;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.PersonPositionHistory;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PositionList;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.database.mappers.PositionMapper;
import mil.dds.anet.utils.DaoUtils;

public class PositionDao implements IAnetDao<Position> {

	private static String[] fields = {"id", "name", "code", "createdAt", 
			"updatedAt", "organizationId", "currentPersonId", "type", 
			"locationId" };
	private static String tableName = "positions";
	public static String POSITIONS_FIELDS  = DaoUtils.buildFieldAliases(tableName, fields);
	
	Handle dbHandle;
	
	public PositionDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public PositionList getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "/* positionGetAll */ SELECT " + POSITIONS_FIELDS + ", COUNT(*) OVER() AS totalCount FROM positions ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "/* positionGetAll */ SELECT " + POSITIONS_FIELDS + " from positions ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Position> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new PositionMapper());
		return PositionList.fromQuery(query, pageNum, pageSize);
	}
	
	public Position insert(Position p) {
		return dbHandle.inTransaction(new TransactionCallback<Position>() {
			public Position inTransaction(Handle conn, TransactionStatus status) throws Exception {
				p.setCreatedAt(DateTime.now());
				p.setUpdatedAt(p.getCreatedAt());
				GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
						"/* positionInsert */ INSERT INTO positions (name, code, type, organizationId, currentPersonId, locationId, createdAt, updatedAt) " 
						+ "VALUES (:name, :code, :type, :organizationId, :currentPersonId, :locationId, :createdAt, :updatedAt)")
					.bindFromProperties(p)
					.bind("type", DaoUtils.getEnumId(p.getType()))
					.bind("organizationId", DaoUtils.getId(p.getOrganization()))
					.bind("currentPersonId", DaoUtils.getId(p.getPerson()))

					.bind("locationId", DaoUtils.getId(p.getLocation()))
					.executeAndReturnGeneratedKeys();
				p.setId(DaoUtils.getGeneratedId(keys));
				
				if (p.getPerson() != null) { 
					dbHandle.createStatement("/*positionInsertPerson*/ INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES (:positionId, :personId, :createdAt)")
						.bind("positionId", p.getId())
						.bind("personId", DaoUtils.getId(p.getPerson()))
						.bind("createdAt", p.getCreatedAt())
						.execute();
				}
				return p;
			}
		});
	}
	
	public Position getById(int id) { 
		Query<Position> query = dbHandle.createQuery("/* positionGetById */ SELECT " + POSITIONS_FIELDS + ", " + PersonDao.PERSON_FIELDS
				+ "FROM positions LEFT JOIN people ON positions.currentPersonId = people.id "
				+ "WHERE positions.id = :id")
			.bind("id", id)
			.map(new PositionMapper());
		List<Position> positions = query.list();
		if (positions.size() == 0) { return null; } 
		return positions.get(0);
	}
	
	/*
	 * @return: number of rows updated. 
	 */
	public int update(Position p) { 
		p.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("/* positionUpdate */ UPDATE positions SET name = :name, "
				+ "code = :code, organizationId = :organizationId, type = :type, "
				+ "locationId = :locationId, updatedAt = :updatedAt WHERE id = :id")
			.bindFromProperties(p)
			.bind("type", DaoUtils.getEnumId(p.getType()))
			.bind("organizationId", DaoUtils.getId(p.getOrganization()))
			.bind("locationId", DaoUtils.getId(p.getLocation()))
			.execute();
	}
	
	public void setPersonInPosition(Person person, Position position) {
		dbHandle.inTransaction(new TransactionCallback<Void>() {
			public Void inTransaction(Handle conn, TransactionStatus status) throws Exception {
				DateTime now = DateTime.now();
				//If this person is in a position already, we need to remove them. 
				Position currPos = dbHandle.createQuery("/* positionSetPerson.find */ SELECT " + POSITIONS_FIELDS 
						+ " FROM positions WHERE currentPersonId = :personId")
					.bind("personId", person.getId())
					.map(new PositionMapper())
					.first();
				if (currPos != null) { 
					dbHandle.createStatement("/* positionSetPerson.remove1 */ UPDATE positions set currentPersonId = null "
							+ "WHERE currentPersonId = :personId")
						.bind("personId", person.getId())
						.execute();
					
					dbHandle.createStatement("/* positionSetPerson.remove2 */ INSERT INTO peoplePositions "
							+ "(positionId, personId, createdAt) "
							+ "VALUES (:positionId, NULL, :createdAt)")
						.bind("positionId", currPos.getId())
						.bind("createdAt", now)
						.execute();
				}
				
				dbHandle.createStatement("/* positionSetPerson.set1 */ UPDATE positions "
						+ "SET currentPersonId = :personId WHERE id = :positionId")
					.bind("personId", person.getId())
					.bind("positionId", position.getId())
					.execute();
				dbHandle.createStatement("/* positionSetPerson.set2 */ INSERT INTO peoplePositions "
						+ "(positionId, personId, createdAt) " 
						+ "VALUES (:positionId, :personId, :createdAt)")
					.bind("positionId", position.getId())
					.bind("personId", person.getId())
					.bind("createdAt", now.plusMillis(1)) // Need to ensure this timestamp is greater than previous INSERT. 
					.execute();
				return null;
			}
		});
		
	}
	
	public void removePersonFromPosition(Position position) {
		dbHandle.inTransaction(new TransactionCallback<Void>() {
			public Void inTransaction(Handle conn, TransactionStatus status) throws Exception {
				DateTime now = DateTime.now();
				dbHandle.createStatement("/*positionRemovePerson.update */ UPDATE positions "
						+ "SET currentPersonId = :personId, updatedAt = :updatedAt "
						+ "WHERE id = :positionId")
					.bind("personId", (Integer) null)
					.bind("updatedAt", now)
					.bind("positionId", position.getId())
					.execute();
					
				String sql;
				if (DaoUtils.isMsSql(dbHandle)) { 
					sql = "/*positionRemovePerson.insert1 */INSERT INTO peoplePositions "
						+ "(positionId, personId, createdAt) "
						+ "VALUES(null, " 
							+ "(SELECT TOP(1)personId FROM peoplePositions WHERE positionId = :positionId ORDER BY createdAt DESC), "
						+ ":createdAt)";
				} else { 
					sql = "/*positionRemovePerson.insert1 */INSERT INTO peoplePositions (positionId, personId, createdAt) "
						+ "VALUES(null, " 
							+ "(SELECT personId FROM peoplePositions WHERE positionId = :positionId ORDER BY createdAt DESC LIMIT 1), " 
						+ ":createdAt)";
				}
				dbHandle.createStatement(sql)
					.bind("positionId", position.getId())
					.bind("createdAt", now)
					.execute();
			
				dbHandle.createStatement("/*positionRemovePerson.insert2 */ INSERT INTO peoplePositions "
						+ "(positionId, personId, createdAt) "
						+ "VALUES (:positionId, null, :createdAt)")
					.bind("positionId", position.getId())
					.bind("createdAt", now)
					.execute();
				return null;
			}
		});
	}
	
	public Person getPersonInPositionNow(Position p) { 
		if (p.getPerson() == null) { return null; } //No person currently in position.
		List<Person> people = dbHandle.createQuery("/*positionFindCurrentPerson */ SELECT " + PersonDao.PERSON_FIELDS 
				+ " FROM people WHERE id = :personId")
			.bind("personId", p.getPerson().getId())
			.map(new PersonMapper())
			.list();
		if (people.size() == 0) { return null; }
		return people.get(0);
	}
	
	public Person getPersonInPosition(Position b, DateTime dtg) { 
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) {
			sql = "/*positionFindPerson */ SELECT TOP(1) " + PersonDao.PERSON_FIELDS + " FROM peoplePositions "
				+ " LEFT JOIN people ON people.id = peoplePositions.personId "
				+ "WHERE peoplePositions.positionId = :positionId "
				+ "AND peoplePositions.createdAt < :dtg "
				+ "ORDER BY peoplePositions.createdAt DESC";
		} else {
			sql = "/*positionFindPerson */ SELECT " + PersonDao.PERSON_FIELDS + " FROM peoplePositions "
				+ " LEFT JOIN people ON people.id = peoplePositions.personId "
				+ "WHERE peoplePositions.positionId = :positionId "
				+ "AND peoplePositions.createdAt < :dtg "
				+ "ORDER BY peoplePositions.createdAt DESC LIMIT 1";
		}
		Query<Person> query = dbHandle.createQuery(sql)
			.bind("positionId", b.getId())
			.bind("dtg", dtg)
			.map(new PersonMapper());
		List<Person> results = query.list();
		if (results.size() == 0) { return null; }
		return results.get(0);
	}

	public List<Person> getPeoplePreviouslyInPosition(Position p) { 
		List<Person> people = dbHandle.createQuery("/*positionFindPreviousPeople */SELECT " + PersonDao.PERSON_FIELDS 
				+ "FROM peoplePositions "
				+ "LEFT JOIN people ON peoplePositions.personId = people.id "
				+ "WHERE peoplePositions.positionId = :positionId " 
				+ "AND peoplePositions.personId IS NOT NULL "
				+ "ORDER BY createdAt DESC")
			.bind("positionId", p.getId())
			.map(new PersonMapper())
			.list();
		//remove the last person, as that's the current position holder
		if (people.size() > 0) { people.remove(people.size() - 1); } 
		return people;
	}
	
	public Position getCurrentPositionForPerson(Person p) {
		List<Position> positions = dbHandle.createQuery("/* getCurrentPositionForPerson */ SELECT " 
				+ POSITIONS_FIELDS + " FROM positions "
				+ "WHERE currentPersonId = :personId")
			.bind("personId", p.getId())
			.map(new PositionMapper())
			.list();
		if (positions.size() == 0) { return null; } 
		return positions.get(0);		
	}
	
	public List<Position> getAllPositionsForPerson(Person p) { 
		return dbHandle.createQuery("/* getAllPositionsForPerson */ SELECT " + POSITIONS_FIELDS 
				+ " FROM positions, peoplePositions "
				+ "WHERE peoplePositions.personId = :personId "
				+ "AND peoplePositions.positionId = positions.id "
				+ "ORDER BY peoplePositions.createdAt DESC")
			.bind("personId", p.getId())
			.map(new PositionMapper())
			.list();
	}

	public List<Position> getAssociatedPositions(Position p) {
		Query<Position> query = dbHandle.createQuery("/* getAssociatedPositions */ SELECT " 
				+ POSITIONS_FIELDS + ", people.* FROM positions "
				+ "LEFT JOIN people ON positions.currentPersonId = people.id "
				+ "WHERE positions.id IN "
				+ "(SELECT positionId_a FROM positionRelationships WHERE positionId_b = :positionId AND deleted = :deleted) "
				+ "OR positions.id IN (SELECT positionId_b FROM positionRelationships WHERE positionId_a = :positionId AND deleted = :deleted)")
			.bind("positionId", p.getId())
			.bind("deleted", false)
			.map(new PositionMapper());
		return query.list();
	}

	public void associatePosition(Position a, Position b) {
		DateTime now = DateTime.now();
		Integer idOne = Math.min(a.getId(), b.getId());
		Integer idTwo = Math.max(a.getId(), b.getId());
		dbHandle.createStatement("/* associatePosition */ INSERT INTO positionRelationships "
				+ "(positionId_a, positionId_b, createdAt, updatedAt, deleted) "
				+ "VALUES (:positionId_a, :positionId_b, :createdAt, :updatedAt, :deleted)")
			.bind("positionId_a", idOne)
			.bind("positionId_b", idTwo)
			.bind("createdAt", now)
			.bind("updatedAt", now)
			.bind("deleted", false)
			.execute();
	}

	public int deletePositionAssociation(Position a, Position b) {
		Integer idOne = Math.min(a.getId(), b.getId());
		Integer idTwo = Math.max(a.getId(), b.getId());
		return dbHandle.createStatement("/* deletePositionAssociation */ UPDATE positionRelationships "
				+ "SET deleted = :deleted, updatedAt = :updatedAt "
				+ "WHERE positionId_a = :positionId_a AND positionId_b = :positionId_b")
			.bind("deleted", true)
			.bind("positionId_a", idOne)
			.bind("positionId_b", idTwo)
			.bind("updatedAt", DateTime.now())
			.execute();
		
	}

	public List<Position> getEmptyPositions(PositionType type) {
		return dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + " FROM positions "
				+ "WHERE currentPersonId IS NULL "
				+ "AND positions.type = :type")
			.bind("type", DaoUtils.getEnumId(type))
			.map(new PositionMapper())
			.list();
	}

	public List<Position> getByOrganization(Organization organization) {
		return dbHandle.createQuery("/* getPositionByOrg */ SELECT " + POSITIONS_FIELDS 
				+ ", people.* from positions "
				+ "LEFT JOIN people ON positions.currentPersonId = people.id "
				+ "WHERE organizationId = :orgId")
			.bind("orgId", organization.getId())
			.map(new PositionMapper())
			.list();
	}
	
	public PositionList search(PositionSearchQuery query) { 
		return AnetObjectEngine.getInstance().getSearcher()
				.getPositionSearcher().runSearch(query, dbHandle);
	}

	public List<PersonPositionHistory> getPositionHistory(Position position) {
		List<Map<String, Object>> results = dbHandle.createQuery("/* getPositionHistory */ SELECT * FROM peoplePositions "
				+ "WHERE positionId = :positionId ORDER BY createdAt ASC")
			.bind("positionId", DaoUtils.getId(position))
			.list();
		
		//Each row is a change of the person/position relationship for this person
		//If the personId is null that means that the previous person was removed from this entry
		//Otherwise the person with that ID was placed in this position, and the previous person removed.
		
		List<PersonPositionHistory> history = new LinkedList<PersonPositionHistory>();
		if (results.size() == 0) { return history; }
		PersonPositionHistory curr = new PersonPositionHistory();
		curr.setPosition(position);
		for (Map<String,Object> row : results) { 
			Integer personId = (Integer) row.get("personId");
			DateTime createdAt = new DateTime(row.get("positions_createdAt"));

			if (DaoUtils.getId(curr.getPerson()) != null) {
				curr.setEndTime(createdAt);
				history.add(curr);
				curr = new PersonPositionHistory();
				curr.setPosition(position);
				if (personId != null) { 
					curr.setPerson(Person.createWithId(personId));
					curr.setStartTime(createdAt);
				}
			} else {
				curr.setPerson(Person.createWithId(personId));
				curr.setStartTime(createdAt);
			}
			
		}
		if (DaoUtils.getId(curr.getPerson()) != null) { 
			history.add(curr);
		}
		return history;
	}

}
