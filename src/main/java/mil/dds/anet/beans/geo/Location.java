package mil.dds.anet.beans.geo;

import java.util.Objects;

public class Location {

	Integer id;
	
	private String name;
	private LatLng latLng;
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
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
				Objects.equals(l.getLatLng(), latLng);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, latLng);
	}
	
	public static Location create(String name, LatLng latLng) { 
		Location l = new Location();
		l.setName(name);
		l.setLatLng(latLng);
		return l;
	}
}
