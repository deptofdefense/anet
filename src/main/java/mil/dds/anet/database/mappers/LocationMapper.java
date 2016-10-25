package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;

public class LocationMapper implements ResultSetMapper<Location> {

	@Override
	public Location map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Location l = new Location();
		l.setId(r.getInt("id"));
		l.setName(r.getString("name"));
		l.setLatLng(new LatLng(r.getDouble("lat"), r.getDouble("lng")));
		return l;
	}

	
}
