package mil.dds.anet.beans.geo;

import java.util.Objects;

import mil.dds.anet.views.AbstractAnetBean;

public class Location extends AbstractAnetBean {

	private String name;
	private LatLng latLng;
		
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
