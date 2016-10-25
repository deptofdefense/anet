package mil.dds.anet.database;

import java.util.List;

import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.mappers.AdvisorOrganizationMapper;
import mil.dds.anet.database.mappers.PersonMapper;

@RegisterMapper(PersonMapper.class)
public interface PersonDao {

	@SqlQuery("select * from people where id = :id")
	Person getById(@Bind("id") int id);
	
	@SqlUpdate("INSERT INTO people " +
			"(firstName, lastName, status, emailAddress, phoneNumber, rank, biography) " +
			"VALUES (:firstName, :lastName, :status, :emailAddress, :phoneNumber, :rank, :biography);")
	@GetGeneratedKeys
	int insertPerson(@BindBean Person p);
	
	@SqlUpdate("UPDATE people " + 
			"SET firstName = :firstName, lastName = :lastName, status = :status, " + 
			"phoneNumber = :phoneNumber, rank = :rank, biography = :biography " +
			"WHERE id = :id")
	int updatePerson(@BindBean Person p);
	
	@SqlQuery("SELECT * from people WHERE firstName LIKE :query || '%' OR lastName LIKE :query || '%'")
	List<Person> searchByName(@Bind("query") String query);
	
	@SqlQuery("SELECT advisorOrganizations.* from advisorOrganizations, billets, billetAdvisors WHERE " + 
		"billetAdvisors.advisorId = :personId AND billetAdvisors.billetId = billets.id " + 
		"AND billets.advisorOrganizationId = advisorOrganizations.id")
	@RegisterMapper(AdvisorOrganizationMapper.class)
	AdvisorOrganization getAdvisorOrganizationForPerson(@Bind("personId") int personId);
	
}
