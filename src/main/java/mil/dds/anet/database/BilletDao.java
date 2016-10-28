package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.mappers.BilletMapper;
import mil.dds.anet.database.mappers.PersonMapper;

@RegisterMapper(BilletMapper.class)
public class BilletDao implements IAnetDao<Billet> {

	Handle dbHandle;
	
	public BilletDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<Billet> getAll(int pageNum, int pageSize) {
		Query<Billet> query = dbHandle.createQuery("SELECT * from billets ORDER BY createdAt ASC LIMIT :limit OFFSET :offset")
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new BilletMapper());
		return query.list();
	}
	
	public Billet insert(Billet b) { 
		b.setCreatedAt(DateTime.now());
		b.setUpdatedAt(DateTime.now());
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO billets (name, advisorOrganizationId, createdAt, updatedAt) " +
				"VALUES (:name, :advisorOrganizationId, :createdAt, :updatedAt)")
			.bind("name", b.getName())
			.bind("advisorOrganizationId", getAoId(b))
			.bind("createdAt", b.getCreatedAt())
			.bind("updatedAt", b.getUpdatedAt())
			.executeAndReturnGeneratedKeys();
		b.setId((Integer) (keys.first().get("last_insert_rowid()")));
		return b;
	}
	
	public Billet getById(int id) { 
		Query<Billet> query = dbHandle.createQuery("SELECT * FROM billets WHERE id = :id")
			.bind("id", id)
			.map(new BilletMapper());
		List<Billet> billets = query.list();
		if (billets.size() == 0) { return null; } 
		return billets.get(0);
	}
	
	/*
	 * @return: number of rows updated. 
	 */
	public int update(Billet b) { 
		b.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("UPDATE billets SET name = :name, advisorOrganizationId = :advisorOrganizationId, updatedAt = :updatedAt WHERE id = :id")
			.bind("name", b.getName())
			.bind("advisorOrganizationId", getAoId(b))
			.bind("updatedAt", b.getUpdatedAt())
			.bind("id", b.getId())
			.execute();
	}
	
	public void setPersonInBillet(Person p, Billet b) { 
		dbHandle.createStatement("INSERT INTO billetAdvisors (billetId, advisorId, createdAt) " +
				"VALUES (:billetId, :advisorId, :createdAt)")
			.bind("billetId", b.getId())
			.bind("advisorId", p.getId())
			.bind("createdAt", DateTime.now())
			.execute();
	}
	
	public void removePersonFromBillet(Billet b) {
		dbHandle.createStatement("INSERT INTO billetAdvisors (billetId, advisorId, createdAt) " + 
			"VALUES(null, " +
				"(SELECT advisorId FROM billetAdvisors WHERE billetId = :billetId ORDER BY createdAt DESC LIMIT 1), " +
			":createdAt)")
			.bind("billetId", b.getId())
			.bind("createdAt", DateTime.now())
			.execute();
	
		dbHandle.createStatement("INSERT INTO billetAdvisors (billetId, advisorId, createdAt) " + 
				"VALUES (:billetId, null, :createdAt)")
			.bind("billetId", b.getId())
			.bind("createdAt", DateTime.now())
			.execute();
	}
	
	public Person getPersonInBilletNow(Billet b) { 
		return getPersonInBillet(b, DateTime.now());
	}
	
	public Person getPersonInBillet(Billet b, DateTime dtg) { 
		Query<Person> query = dbHandle.createQuery("SELECT people.* FROM billetAdvisors " +
				" LEFT JOIN people ON people.id = billetAdvisors.advisorId " +
				"WHERE billetAdvisors.billetId = :billetId " +
				"AND billetAdvisors.createdAt < :dtg " + 
				"ORDER BY billetAdvisors.createdAt DESC LIMIT 1")
			.bind("billetId", b.getId())
			.bind("dtg", dtg)
			.map(new PersonMapper());
		List<Person> results = query.list();
		if (results.size() == 0 ) { return null; }
		return results.get(0);
	}

	public List<Billet> getAllBillets(int pageNum, int pageSize) {
		Query<Billet> query = dbHandle.createQuery("SELECT * from billets ORDER BY createdAt ASC LIMIT :limit OFFSET :offset")
				.bind("limit", pageSize)
				.bind("offset", pageSize * pageNum)
				.map(new BilletMapper());
			return query.list();
	}
	
	private Integer getAoId(Billet b) { 
		if (b.getAdvisorOrganizationJson() == null) { return null; }
		return b.getAdvisorOrganizationJson().getId();
	}
}
