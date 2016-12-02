package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.mappers.LocationMapper;
import mil.dds.anet.utils.DaoUtils;

@RegisterMapper(LocationMapper.class)
public class LocationDao implements IAnetDao<Location> {

	Handle dbHandle;
	
	public LocationDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public List<Location> getAll(int pageNum, int pageSize) { 
		Query<Location> query = dbHandle.createQuery("SELECT * from locationsORDER BY createdAt ASC LIMIT :limit OFFSET :offset")
				.bind("limit", pageSize)
				.bind("offset", pageSize * pageNum)
				.map(new LocationMapper());
			return query.list();
	}
	
	@Override
	public Location getById(@Bind("id") int id) { 
		Query<Location> query = dbHandle.createQuery("SELECT * from locations where id = :id")
				.bind("id", id)
				.map(new LocationMapper());
			List<Location> results = query.list();
			if (results.size() == 0) { return null; } 
			return results.get(0);
	}
	
	@Override
	public Location insert(Location l) { 
		l.setCreatedAt(DateTime.now());
		l.setUpdatedAt(DateTime.now());
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO locations (name, lat, lng, createdAt, updatedAt) " + 
				"VALUES (:name, :lat, :lng, :createdAt, :updatedAt)")
			.bind("name", l.getName())
			.bind("lat", l.getLatLng().getLat())
			.bind("lng", l.getLatLng().getLng())
			.bind("createdAt", l.getCreatedAt())
			.bind("updatedAt", l.getUpdatedAt())
			.executeAndReturnGeneratedKeys();
		l.setId(DaoUtils.getGeneratedId(keys));
		return l;
	}
	
	
	@Override
	public int update(Location l) {
		return dbHandle.createStatement("UPDATE locations SET name = :name, lat = :lat, lng = :lng, updatedAt = :updatedAt WHERE id = :id")
				.bind("id", l.getId())
				.bind("name", l.getName())
				.bind("lat", l.getLatLng().getLat())
				.bind("lng", l.getLatLng().getLng())
				.bind("updatedAt", DateTime.now()	)
				.execute();
	}

	public List<Location> searchByName(String name) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			name = "\"" + name + "*\"";
			sql = "SELECT * FROM locations WHERE CONTAINS (name, :name)";
		} else { 
			sql = "SELECT * FROM locations WHERE name LIKE '%' || :name || '%'";
		}
		Query<Location> query = dbHandle.createQuery(sql)
			.bind("name", name)
			.map(new LocationMapper());
		return query.list();
	}
	
	//TODO: Don't delete any location if any references exist. 
	
}
