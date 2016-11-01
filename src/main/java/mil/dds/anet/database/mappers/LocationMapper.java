package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.StatementContext;
import org.skife.jdbi.v2.tweak.ResultSetMapper;

import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class LocationMapper implements ResultSetMapper<Location> {

	@Override
	public Location map(int index, ResultSet r, StatementContext ctx) throws SQLException {
		Location l = new Location();
		l.setId(r.getInt("id"));
		l.setName(r.getString("name"));
		l.setLatLng(new LatLng(r.getDouble("lat"), r.getDouble("lng")));
		l.setCreatedAt(new DateTime(r.getLong("createdAt")));
		l.setUpdatedAt(new DateTime(r.getLong("updatedAt")));
		l.setLoadLevel(LoadLevel.PROPERTIES);
		return l;
	}

	
}
