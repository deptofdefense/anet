package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.views.AbstractAnetView;

public class Position extends AbstractAnetView<Position> {

	String name;
	String code;
	
	DateTime createdAt;
	DateTime updatedAt;
	Organization organization;
	
	//Lazy Loaded
	Person person;
	List<Position> associatedPositions;

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
		if (person == null) { 
			person = AnetObjectEngine.getInstance()
					.getPositionDao().getPersonInPositionNow(this);
		}
		return person;
	}
	
	@JsonIgnore
	public List<Position> getAssociatedPositions() { 
		if (associatedPositions == null) { 
			associatedPositions = AnetObjectEngine.getInstance()
				.getPositionDao().getAssociatedPositions(this);
		}
		return associatedPositions;
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
			idEqual(organization, other.getOrganizationJson());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, code, organization);
	}
	
}
