package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.views.AbstractAnetView;

public class Position extends AbstractAnetView<Position> {

	public static enum PositionType { ADVISOR, PRINCIPAL }
	
	String name;
	String code;
	PositionType type;
	
	DateTime createdAt;
	DateTime updatedAt;
	
	//Lazy Loaded
	Organization organization;
	Person person; //The Current person.
	List<Position> associatedPositions;
	private Location location;

	public static Position createWithId(Integer id) { 
		Position b = new Position();
		b.setId(id);
		return b;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public DateTime getCreatedAt() {
		return createdAt;
	}

	public PositionType getType() {
		return type;
	}

	public void setType(PositionType type) {
		this.type = type;
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

	@JsonIgnore
	public Organization getOrganization() {
		if (organization == null) { return null; } 
		if (organization.getLoadLevel() == null ) { 
			return organization; // just a bean, not a db object! 
		}
		if (organization.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) {
			this.organization = AnetObjectEngine.getInstance()
					.getOrganizationDao().getById(organization.getId());
		}
		return organization;
	}
	
	@JsonSetter("organization")
	public void setOrganization(Organization ao) {
		this.organization = ao;
	}
	
	@JsonGetter("organization")
	public Organization getOrganizationJson() { 
		return organization;
	}
	
	@JsonIgnore
	public Person getPerson() { 
		if (person == null || person.getLoadLevel() == null) { return person; } 
		if (person.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.person = AnetObjectEngine.getInstance()
					.getPositionDao().getPersonInPositionNow(this);
		}
		return person;
	}
	
	@JsonGetter("person")
	public Person getPersonJson() { 
		return person;
	}
	
	@JsonSetter("person")
	public void setPerson(Person p) {
		this.person = p;
	}
	
	@JsonIgnore
	public List<Position> getAssociatedPositions() { 
		if (associatedPositions == null) { 
			associatedPositions = AnetObjectEngine.getInstance()
				.getPositionDao().getAssociatedPositions(this);
		}
		return associatedPositions;
	}
	
	@JsonIgnore
	public Location getLocation() { 
		if (location == null || location.getLoadLevel() == null) { return location; } 
		if (location.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.location = AnetObjectEngine.getInstance()
					.getLocationDao().getById(location.getId());
		}
		return location;
	}
	
	@JsonGetter("location")
	public Location getLocationJson() { 
		return location;
	}
	
	@JsonSetter("location")
	public void setLocation(Location location) { 
		this.location = location;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != Position.class) { 
			return false; 
		}
		Position other = (Position) o;
		return Objects.equals(id, other.getId()) &&
			Objects.equals(name, other.getName()) &&
			Objects.equals(code,  other.getCode()) && 
			Objects.equals(type, other.getType()) && 
			idEqual(organization, other.getOrganizationJson());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, code, type, organization);
	}
	
}
