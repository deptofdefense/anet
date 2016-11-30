package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.database.mappers.PositionMapper;
import mil.dds.anet.utils.DaoUtils;

public class PositionDao implements IAnetDao<Position> {

	private static String POSITIONS_FIELDS  = "positions.id AS pos_id, positions.name AS pos_name, positions.code AS pos_code, positions.type AS pos_type, "
			+ "positions.createdAt AS pos_createdAt, positions.updatedAt AS pos_updatedAt, positions.organizationId AS pos_organizationId, " 
			+ "positions.currentPersonId AS pos_currentPersonId, positions.locationId AS pos_locationId ";
	
	Handle dbHandle;
	
	public PositionDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<Position> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT " + POSITIONS_FIELDS + " FROM positions ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT " + POSITIONS_FIELDS + " from positions ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Position> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new PositionMapper());
		return query.list();
	}
	
	public Position insert(Position p) { 
		p.setCreatedAt(DateTime.now());
		p.setUpdatedAt(p.getCreatedAt());
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO positions (name, code, type, organizationId, currentPersonId, locationId, createdAt, updatedAt) " +
				"VALUES (:name, :code, :type, :organizationId, :currentPersonId, :locationId, :createdAt, :updatedAt)")
			.bindFromProperties(p)
			.bind("type", DaoUtils.getEnumId(p.getType()))
			.bind("organizationId", DaoUtils.getId(p.getOrganizationJson()))
			.bind("currentPersonId", DaoUtils.getId(p.getPersonJson()))

			.bind("locationId", DaoUtils.getId(p.getLocation()))
			.executeAndReturnGeneratedKeys();
		p.setId(DaoUtils.getGeneratedId(keys));
		
		//TODO: this should be in a transaction.
		if (p.getPersonJson() != null) { 
			dbHandle.createStatement("INSERT INTO peoplePositions (positionId, personId, createdAt) VALUES (:positionId, :personId, :createdAt)")
				.bind("positionId", p.getId())
				.bind("personId", DaoUtils.getId(p.getPersonJson()))
				.bind("createdAt", p.getCreatedAt())
				.execute();
		}
		return p;
	}
	
	
	
	public Position getById(int id) { 
		Query<Position> query = dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + ", people.* "
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
		return dbHandle.createStatement("UPDATE positions SET name = :name, "
				+ "code = :code, organizationId = :organizationId, type = :type, "
				+ "locationId = :locationId, updatedAt = :updatedAt WHERE id = :id")
			.bindFromProperties(p)
			.bind("type", DaoUtils.getEnumId(p.getType()))
			.bind("organizationId", DaoUtils.getId(p.getOrganization()))
			.bind("locationId", DaoUtils.getId(p.getLocation()))
			.execute();
	}
	
	public void setPersonInPosition(Person person, Position position) {
		//TODO: this should be in a transaction. 
		DateTime now = DateTime.now();
		//If this person is in a position already, we need to remove them. 
		dbHandle.createStatement("UPDATE positions set currentPersonId = null WHERE currentPersonId = :personId")
			.bind("personId", person.getId())
			.execute();
			
		dbHandle.createStatement("UPDATE positions SET currentPersonId = :personId WHERE id = :positionId")
			.bind("personId", person.getId())
			.bind("positionId", position.getId())
			.execute();
		dbHandle.createStatement("INSERT INTO peoplePositions (positionId, personId, createdAt) " +
				"VALUES (:positionId, :personId, :createdAt)")
			.bind("positionId", position.getId())
			.bind("personId", person.getId())
			.bind("createdAt", now)
			.execute();
	}
	
	public void removePersonFromPosition(Position position) {
		DateTime now = DateTime.now();
		dbHandle.createStatement("UPDATE positions SET currentPersonId = :personId, updatedAt = :updatedAt WHERE id = :positionId")
			.bind("personId", (Integer) null)
			.bind("updatedAt", now)
			.bind("positionId", position.getId())
			.execute();
			
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "INSERT INTO peoplePositions (positionId, personId, createdAt) " + 
					"VALUES(null, " +
					"(SELECT TOP(1)personId FROM peoplePositions WHERE positionId = :positionId ORDER BY createdAt DESC), " +
				":createdAt)";
		} else { 
			sql = "INSERT INTO peoplePositions (positionId, personId, createdAt) " + 
					"VALUES(null, " +
					"(SELECT personId FROM peoplePositions WHERE positionId = :positionId ORDER BY createdAt DESC LIMIT 1), " +
				":createdAt)";
		}
		dbHandle.createStatement(sql)
			.bind("positionId", position.getId())
			.bind("createdAt", now)
			.execute();
	
		dbHandle.createStatement("INSERT INTO peoplePositions (positionId, personId, createdAt) " + 
				"VALUES (:positionId, null, :createdAt)")
			.bind("positionId", position.getId())
			.bind("createdAt", now)
			.execute();
	}
	
	public Person getPersonInPositionNow(Position p) { 
		if (p.getPersonJson() == null) { return null; } //No person currently in position.
		List<Person> people = dbHandle.createQuery("SELECT people.* FROM people WHERE id = :personId")
			.bind("personId", p.getPersonJson().getId())
			.map(new PersonMapper())
			.list();
		if (people.size() == 0) { return null; }
		return people.get(0);
	}
	
	public Person getPersonInPosition(Position b, DateTime dtg) { 
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT TOP(1)people.* FROM peoplePositions " +
					" LEFT JOIN people ON people.id = peoplePositions.personId " +
					"WHERE peoplePositions.positionId = :positionId " +
					"AND peoplePositions.createdAt < :dtg " + 
					"ORDER BY peoplePositions.createdAt DESC";
		} else { 
			sql = "SELECT people.* FROM peoplePositions " +
				" LEFT JOIN people ON people.id = peoplePositions.personId " +
				"WHERE peoplePositions.positionId = :positionId " +
				"AND peoplePositions.createdAt < :dtg " + 
				"ORDER BY peoplePositions.createdAt DESC LIMIT 1";
		}
		Query<Person> query = dbHandle.createQuery(sql)
			.bind("positionId", b.getId())
			.bind("dtg", dtg)
			.map(new PersonMapper());
		List<Person> results = query.list();
		if (results.size() == 0 ) { return null; }
		return results.get(0);
	}

	public List<Person> getPeoplePreviouslyInPosition(Position p) { 
		List<Person> people = dbHandle.createQuery("SELECT people.* from peoplePositions "
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
		List<Position> positions = dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + " FROM positions WHERE currentPersonId = :personId")
			.bind("personId", p.getId())
			.map(new PositionMapper())
			.list();
		if (positions.size() == 0) { return null; } 
		return positions.get(0);		
	}
	
	public List<Position> getAllPositionsForPerson(Person p) { 
		return dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + " FROM positions, peoplePositions "
				+ "WHERE peoplePositions.personId = :personId "
				+ "AND peoplePositions.positionId = positions.id "
				+ "ORDER BY peoplePositions.createdAt DESC")
			.bind("personId", p.getId())
			.map(new PositionMapper())
			.list();
	}

	public List<Position> getAssociatedPositions(Position p) {
		Query<Position> query = dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + ", people.* FROM positions "
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
		dbHandle.createStatement("INSERT INTO positionRelationships (positionId_a, positionId_b, createdAt, updatedAt, deleted) " + 
				"VALUES (:positionId_a, :positionId_b, :createdAt, :updatedAt, :deleted)")
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
		return dbHandle.createStatement("UPDATE positionRelationships SET deleted = :deleted, updatedAt = :updatedAt " + 
				"WHERE positionId_a = :positionId_a AND positionId_b = :positionId_b")
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
		return dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + ", people.* from positions "
				+ "LEFT JOIN people ON positions.currentPersonId = people.id "
				+ "WHERE organizationId = :orgId")
			.bind("orgId", organization.getId())
			.map(new PositionMapper())
			.list();
	}

	public List<Position> getByCode(String code, boolean prefixMatch, PositionType type) {
		StringBuilder queryBuilder = new StringBuilder("SELECT " + POSITIONS_FIELDS + " from positions WHERE ");
		if (prefixMatch) { 
			queryBuilder.append("code LIKE :code || '%' ");
		} else { 
			queryBuilder.append("code = :code");
		}
		if (type != null) { 
			queryBuilder.append("AND type = :type");
		}
		return dbHandle.createQuery(queryBuilder.toString())
			.bind("code", code)
			.bind("type", DaoUtils.getEnumId(type))
			.map(new PositionMapper())
			.list();
	}
	
	public List<Position> search(String query) { 
		return dbHandle.createQuery("SELECT " + POSITIONS_FIELDS + " FROM positions "
				+ "WHERE name LIKE '%' || :q || '%' "
				+ "OR code LIKE '%' || :q || '%'")
			.bind("q", query)
			.map(new PositionMapper())
			.list();
	}

}
