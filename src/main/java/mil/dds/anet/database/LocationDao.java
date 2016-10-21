package mil.dds.anet.database;

import java.util.List;

import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.GetGeneratedKeys;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;

@RegisterMapper(LocationMapper.class)
public interface LocationDao {

	@SqlQuery("SELECT * from locations where id = :id")
	Location getById(@Bind("id") int id);
	
	@SqlUpdate("INSERT INTO locations (name, lat, lng) VALUES (:l.name, :latLng.lat, :latLng.lng)")
	@GetGeneratedKeys
	int insertLocation(@BindBean("l") Location l, @BindBean("latLng") LatLng latLng);
	
	@SqlUpdate("UPDATE locations SET name = :l.name, lat = :latLng.lat, lng = :latLng.lng WHERE id = :l.id")
	int updateLocation(@BindBean("l") Location l, @BindBean("latLng") LatLng latLng);

	@SqlQuery("SELECT * from locations where name LIKE :name")
	List<Location> searchByName(@Bind("name") String name);
	
	//TODO: Don't delete any location if any references exist. 
	
}
