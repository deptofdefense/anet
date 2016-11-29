package mil.dds.anet.beans.geo;

import java.util.Objects;

import org.joda.time.DateTime;

import mil.dds.anet.views.AbstractAnetView;

public class Location extends AbstractAnetView<Location> {

	private String name;
	private LatLng latLng;
	
	private DateTime createdAt;
	private DateTime updatedAt;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public LatLng getLatLng() {
		return latLng;
	}
	public void setLatLng(LatLng latLng) {
		this.latLng = latLng;
	}
	
	public DateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(DateTime createdAt) {
		this.createdAt = createdAt;
	}
	
	public DateTime getUpdatedAt() {
		return updatedAt;
	}
	public void setUpdatedAt(DateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != Location.class) { 
			return false;
		}
		Location l = (Location) o;
		return Objects.equals(l.getId(), id) &&
				Objects.equals(l.getName(), name) &&
				Objects.equals(l.getLatLng(), latLng) &&
				Objects.equals(l.getCreatedAt(), createdAt);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, latLng, createdAt);
	}
	
	@Override
	public String toString() { 
		return String.format("(%d) - %s [%f, %f]", id, name, latLng.getLat(), latLng.getLng()); 
	}
	
	public static Location create(String name, LatLng latLng) { 
		Location l = new Location();
		l.setName(name);
		l.setLatLng(latLng);
		return l;
	}
	
	public static Location createWithId(Integer id) {
		Location l = new Location();
		l.setId(id);
		l.setLoadLevel(LoadLevel.ID_ONLY);
		return l;
	}
	
	
}
