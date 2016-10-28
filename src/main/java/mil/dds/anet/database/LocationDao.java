package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.database.mappers.LocationMapper;

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
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO locations (name, lat, lng) VALUES (:l.name, :latLng.lat, :latLng.lng)")
			.bind("name", l.getName())
			.bind("lat", l.getLatLng().getLat())
			.bind("lng", l.getLatLng().getLng())
			.bind("createdAt", l.getCreatedAt())
			.executeAndReturnGeneratedKeys();
		l.setId((Integer) (keys.first().get("last_insert_rowid()")));
		return l;
	}
	
	
	@Override
	public int update(Location l) {
		return dbHandle.createStatement("UPDATE locations SET name = :l.name, lat = :latLng.lat, lng = :latLng.lng WHERE id = :l.id")
				.bind("name", l.getName())
				.bind("lat", l.getLatLng().getLat())
				.bind("lng", l.getLatLng().getLng())
				.execute();
	}

	public List<Location> searchByName(@Bind("name") String name) { 
		Query<Location> query = dbHandle.createQuery("SELECT * FROM locations WHERE Name LIKE :name")
			.bind("name", name)
			.map(new LocationMapper());
		return query.list();
	}
	
	//TODO: Don't delete any location if any references exist. 
	
}
