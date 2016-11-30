package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Poam;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.utils.DaoUtils;

@RegisterMapper(PoamMapper.class)
public class PoamDao implements IAnetDao<Poam> {

	Handle dbHandle;
	
	public PoamDao(Handle h) { 
		this.dbHandle = h; 
	}
	
	public List<Poam> getAll(int pageNum, int pageSize) { 
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT * FROM poams ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT * from poams ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Poam> query = dbHandle.createQuery(sql)
				.bind("limit", pageSize)
				.bind("offset", pageSize * pageNum)
				.map(new PoamMapper());
			return query.list();
	}
	
	@Override
	public Poam getById(int id) { 
		Query<Poam> query = dbHandle.createQuery("SELECT * from poams where id = :id")
			.bind("id",id)
			.map(new PoamMapper());
		List<Poam> results = query.list();
		if (results.size() == 0) { return null; } 
		return results.get(0);
	}
	
	@Override
	public Poam insert(Poam p){
		p.setCreatedAt(DateTime.now());
		p.setUpdatedAt(DateTime.now());
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement("INSERT INTO poams (longName, shortName, category, parentPoamId) " + 
				"VALUES (:longName, :shortName, :category, :parentPoamId)")
			.bindFromProperties(p)
			.bind("parentPoamId", (p.getParentPoam() == null) ? null : p.getParentPoam().getId())
			.executeAndReturnGeneratedKeys();
		p.setId(DaoUtils.getGeneratedId(keys));
		return p;
	}
	
	@Override
	public int update(Poam p) { 
		p.setUpdatedAt(DateTime.now());
		return dbHandle.createStatement("UPDATE poams set longName = :longName, shortName = :shortName, " + 
				"category = :category, parentPoamId = :parentPoamId " + 
				"WHERE id = :id")
			.bindFromProperties(p)
			.bind("parentPoamId", DaoUtils.getId(p.getParentPoamJson()))
			.execute();
	}
	
	public List<Poam> getPoamsByParentId(int parentPoamId) { 
		Query<Poam> query = dbHandle.createQuery("SELECT * from poams where parentPoamId = :parentPoamId")
			.bind("parentPoamId", parentPoamId)
			.map(new PoamMapper());
		return query.list();
	}

	public List<Poam> getPoamsByCategory(String category) { 
		Query<Poam> query = dbHandle.createQuery("SELECT * from poams WHERE category = :cat")
			.bind("cat", category)
			.map(new PoamMapper());
		return query.list();
	}
	
	/* Returns the poam and all poams under this one (to all depths) */
	public List<Poam> getPoamAndChildren(int poamId) {
		StringBuilder sql = new StringBuilder();
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql.append("WITH");
		} else { 
			sql.append("WITH RECURSIVE");
		}
		sql.append(" parent_poams(id, shortName, longName, category, parentPoamId, createdAt, updatedAt) AS (" + 
				"SELECT * FROM poams WHERE id = :poamId " + 
			"UNION ALL " + 
				"SELECT p.* from parent_poams pp, poams p WHERE p.parentPoamId = pp.id " +
			") SELECT * from parent_poams;");
		return dbHandle.createQuery(sql.toString())
			.bind("poamId", poamId)
			.map(new PoamMapper())
			.list();
	}

	public List<Poam> getTopLevelPoams() {
		return dbHandle.createQuery("SELECT * FROM poams WHERE parentPoamId IS NULL")
			.map(new PoamMapper())
			.list();
	}

	public List<Poam> search(String query) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			query = "\"" + query + "*\"";
			sql = "SELECT * FROM poams WHERE CONTAINS((longName, shortName), :q)";
		} else { 
			sql = "SELECT * FROM poams WHERE longName LIKE '%' || :q || '%' OR shortName LIKE '%' || :q || '%'";
		}
		return dbHandle.createQuery(sql)
			.map(new PoamMapper())
			.bind("q", query)
			.list();
	}
}
