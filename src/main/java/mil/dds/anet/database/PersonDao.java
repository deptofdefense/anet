package mil.dds.anet.database;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import com.google.common.base.Joiner;
import com.google.common.collect.Sets;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Billet;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Tashkil;
import mil.dds.anet.database.mappers.AdvisorOrganizationMapper;
import mil.dds.anet.database.mappers.BilletMapper;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.database.mappers.TashkilMapper;

@RegisterMapper(PersonMapper.class)
public class PersonDao implements IAnetDao<Person> {

	Handle dbHandle;
	
	public PersonDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<Person> getAll(int pageNum, int pageSize) {
		Query<Person> query = dbHandle.createQuery("SELECT * from people ORDER BY createdAt ASC LIMIT :limit OFFSET :offset")
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new PersonMapper());
		return query.list();
	}

	public Person getById(int id) { 
		Query<Person> query = dbHandle.createQuery("select * from people where id = :id")
				.bind("id",  id)
				.map(new PersonMapper());
		List<Person> rs = query.list();
		if (rs.size() == 0) { return null; } 
		return rs.get(0);
	}
	
	public Person insert(@BindBean Person p){
		p.setCreatedAt(DateTime.now());
		p.setUpdatedAt(DateTime.now());
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement("INSERT INTO people " +
				"(firstName, lastName, status, role, emailAddress, phoneNumber, rank, pendingVerification, biography, createdAt, updatedAt) " +
				"VALUES (:firstName, :lastName, :status, :role, :emailAddress, :phoneNumber, :rank, :pendingVerification, :biography, :createdAt, :updatedAt);")
			.bindFromProperties(p)
			.bind("status", (p.getStatus() != null ) ? p.getStatus().ordinal() : null)
			.bind("role", p.getRole().ordinal())
			.executeAndReturnGeneratedKeys();
		p.setId((Integer)keys.first().get("last_insert_rowid()"));
		return p;
	}
	
	public int update(@BindBean Person p){
		p.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("UPDATE people " + 
				"SET firstName = :firstName, lastName = :lastName, status = :status, role = :role, " + 
				"phoneNumber = :phoneNumber, rank = :rank, biography = :biography, " +
				"pendingVerification = :pendingVerification WHERE id = :id")
			.bindFromProperties(p)
			.execute();
	}
	
	
	public List<Person> searchByName(String searchQuery, Role role) { 
		String queryString = "SELECT * from people WHERE ( firstName LIKE :query || '%' OR lastName LIKE :query || '%')	";
		if (role != null ) { 
			queryString += " AND role = :role";
		}
		Query<Person> query = dbHandle.createQuery(queryString)
			.bind("query", searchQuery)
			.bind("role", (role != null) ? role.ordinal() : null)
			.map(new PersonMapper());
		return query.list();
	}
	
	@RegisterMapper(AdvisorOrganizationMapper.class)
	public AdvisorOrganization getAdvisorOrganizationForPerson(@Bind("personId") int personId) { 
		Query<AdvisorOrganization> query = dbHandle.createQuery("SELECT advisorOrganizations.* " +
				"FROM advisorOrganizations, billets, billetAdvisors WHERE " + 
				"billetAdvisors.advisorId = :personId AND billetAdvisors.billetId = billets.id " + 
				"AND billets.advisorOrganizationId = advisorOrganizations.id " + 
				"ORDER BY billetAdvisors.createdAt DESC LIMIT 1")
			.bind("personId", personId)
			.map(new AdvisorOrganizationMapper());
		List<AdvisorOrganization> rs = query.list();
		if (rs.size() == 0) { return null; } 
		return rs.get(0);
	}

	public List<Person> findByProperty(String ...strings) {
		if (strings.length % 2 != 0 ) { throw new RuntimeException("Illegal number of arguments to findByProperty: " + strings.toString()); }
		HashSet<String> props = Sets.newHashSet("firstName","lastName","emailAddress","rank","phoneNumber","status");
		List<String> conditions = new ArrayList<String>();
		
		for (int i=0;i<strings.length;i+=2) { 
			if (props.contains(strings[i])) { 
				conditions.add(strings[i] + " = ? ");
			}
		}
		String queryString = "SELECT * from people WHERE " + Joiner.on(" AND ").join(conditions);
		Query<Map<String, Object>> query = dbHandle.createQuery(queryString);
		for (int i=0;i<strings.length;i+=2) { 
			query.bind((i/2), strings[i+1]);
		}
		return query.map(new PersonMapper()).list();
	}

}
