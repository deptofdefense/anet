package mil.dds.anet.database;

import java.util.List;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.Mapper;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Tashkil;

@RegisterMapper(TashkilMapper.class)
public interface TashkilDao {

	@SqlQuery("SELECT * from tashkils where id = :id")
	Tashkil getById(@Bind("id") int id);
	
	@SqlUpdate("INSERT INTO tashkils (code, name) VALUES (:code, :name)")
	@GetGeneratedKeys
	int insertTashkil(@BindBean Tashkil t);
	
	@SqlUpdate("UPDATE tashkils SET name = :name, code = :code WHERE id = :id")
	int updateTashkil(@BindBean Tashkil t);
	
	@SqlQuery("SELECT * from tashkils where code = :code")
	List<Tashkil> getByCode(@Bind("code") String code);
	
	@SqlQuery("SELECT * from tashkils where code LIKE :code")
	List<Tashkil> getByCodePrefix(@Bind("code") String code);
	
	@SqlQuery("SELECT people.* FROM people, tashkilPrincipals " + 
			"WHERE people.id = tashkilPrincipals.principalId " +
			"AND tashkilPrincipals.tashkilId = :tashkilId " +
			"ORDER BY tashkilPrincipals.dtg DESC LIMIT 1")
	@Mapper(PersonMapper.class)
	Person getPrincipal(@Bind("tashkilId") int tashkilId);
	
	@SqlUpdate("INSERT INTO tashkilPrincipals (tashkilId, principalId, dtg) VALUES (:tashkilId, :principalId, :dtg)")
	int setPrincipal(@Bind("tashkilId") int tashkilId, @Bind("principalId") int principalId, @Bind("dtg") DateTime dtg);
}
