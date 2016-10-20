package mil.dds.anet.database;

import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Person;

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
			"phoneNumber = :phoneNumber, rank = :rank, biography = :biography" +
			"WHERE id = :id")
	int updatePerson(@BindBean Person p);
	
	@SqlUpdate("DELETE FROM People WHERE id = :id")
	void deletePersonById(@Bind("id") int id);
}
