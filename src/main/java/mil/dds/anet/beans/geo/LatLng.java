package mil.dds.anet.beans.geo;

import java.util.Objects;

public class LatLng {

	private Double lat;
	private Double lng;
	
	public LatLng() {};
	
	public LatLng(Double lat, Double lng) { 
		this.lat = lat;
		this.lng = lng;
	}
	
	public Double getLat() {
		return lat;
	}
	public void setLat(Double lat) {
		this.lat = lat;
	}
	public Double getLng() {
		return lng;
	}
	public void setLng(Double lng) {
		this.lng = lng;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != LatLng.class) { 
			return false;
		}
		LatLng l = (LatLng) o;
		return Objects.equals(l.getLat(), lat) &&
				Objects.equals(l.getLng(), lng);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(lat, lng);
	}
	
}
