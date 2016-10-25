package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.mappers.BilletMapper;
import mil.dds.anet.database.mappers.PersonMapper;

public class BilletDao {

	Handle dbHandle;
	
	public BilletDao(Handle h) { 
		this.dbHandle = h;
	}
	
	/*
	 * @return: ID of new billet created
	 */
	public int createNewBillet(Billet b) { 
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO billets (name, advisorOrganizationId) " +
				"VALUES (:name, :advisorOrganizationId)")
			.bind("name", b.getName())
			.bind("advisorOrganizationId", b.getAdvisorOrganizationId())
			.executeAndReturnGeneratedKeys();
		return (Integer) (keys.first().get("last_insert_rowid()"));
	}
	
	public Billet getBilletById(int id) { 
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
	public int updateBillet(Billet b) { 
		return dbHandle.createStatement("UPDATE billets SET name = :name, advisorOrganizationId = :advisorOrganizationId WHERE id = :id")
			.bind("name", b.getName())
			.bind("advisorOrganizationId", b.getAdvisorOrganizationId())
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
	
	public Person getPersonInBillet(Billet b) { 
		Query<Person> query = dbHandle.createQuery("SELECT people.* FROM people, billetAdvisors " +
				"WHERE billetAdvisors.billetId = :billetId ORDER BY createdAt DESC LIMIT 1")
			.bind("billetId", b.getId())
			.map(new PersonMapper());
		List<Person> results = query.list();
		if (results.size() == 0 ) { return null; }
		return results.get(0);
	}
}
