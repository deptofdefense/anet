package mil.dds.anet.database;

import java.util.List;

import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Poam;
import mil.dds.anet.database.mappers.PoamMapper;

@RegisterMapper(PoamMapper.class)
public interface PoamDao {

	@SqlQuery("SELECT * from poams where id = :id")
	Poam getPoamById(@Bind("id") int id);
	
	@SqlUpdate("INSERT INTO poams (longName, shortName, category, parentPoamId) " + 
			"VALUES (:longName, :shortName, :category, :parentPoamId)")
	@GetGeneratedKeys
	int insertPoam(@BindBean Poam p);
	
	@SqlUpdate("UPDATE poams set longName = :longName, shortName = :shortName " + 
			"category = :category, parentPoamId = :parentPoamId " + 
			"WHERE id = :id")
	int updatePoam(@BindBean Poam p);
	
	@SqlQuery("SELECT * from poams where parentPoamId = :parentPoamId")
	List<Poam> getPoamsByParentId(@Bind("parentPoamId") int parentPoamId);
}
