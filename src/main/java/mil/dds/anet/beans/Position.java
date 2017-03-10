package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.graphql.GraphQLFetcher;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.utils.DaoUtils;
import mil.dds.anet.views.AbstractAnetBean;

public class Position extends AbstractAnetBean {

	public static enum PositionType { ADVISOR, PRINCIPAL, SUPER_USER, ADMINISTRATOR }
	public static enum PositionStatus {ACTIVE, INACTIVE} 
	
	String name;
	String code;
	PositionType type;
	PositionStatus status;
		
	//Lazy Loaded
	Organization organization;
	Person person; //The Current person.
	List<Position> associatedPositions;
	Location location;
	List<PersonPositionHistory> previousPeople;

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

	public PositionType getType() {
		return type;
	}

	public void setType(PositionType type) {
		this.type = type;
	}

	public PositionStatus getStatus() {
		return status;
	}

	public void setStatus(PositionStatus status) {
		this.status = status;
	}

	@GraphQLFetcher("organization")
	public Organization loadOrganization() {
		if (organization == null || organization.getLoadLevel() == null) { 
			return organization; // just a bean, not a db object! 
		}
		if (organization.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) {
			this.organization = AnetObjectEngine.getInstance()
					.getOrganizationDao().getById(organization.getId());
		}
		return organization;
	}
	
	public void setOrganization(Organization ao) {
		this.organization = ao;
	}
	
	@GraphQLIgnore
	public Organization getOrganization() { 
		return organization;
	}
	
	@GraphQLFetcher("person")
	public Person loadPerson() { 
		if (person == null || person.getLoadLevel() == null) { return person; } 
		if (person.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.person = AnetObjectEngine.getInstance()
					.getPositionDao().getPersonInPositionNow(this);
		}
		return person;
	}
	
	@GraphQLIgnore
	public Person getPerson() { 
		return person;
	}
	
	public void setPerson(Person p) {
		this.person = p;
	}
	
	@GraphQLFetcher("associatedPositions")
	public List<Position> loadAssociatedPositions() { 
		if (associatedPositions == null) { 
			associatedPositions = AnetObjectEngine.getInstance()
				.getPositionDao().getAssociatedPositions(this);
		}
		return associatedPositions;
	}
	
	@GraphQLIgnore
	public List<Position> getAssociatedPositions() { 
		return associatedPositions;
	}
	
	public void setAssociatedPositions(List<Position> associatedPositions) { 
		this.associatedPositions = associatedPositions;
	}
	
	@GraphQLFetcher("location")
	public Location loadLocation() { 
		if (location == null || location.getLoadLevel() == null) { return location; } 
		if (location.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.location = AnetObjectEngine.getInstance()
					.getLocationDao().getById(location.getId());
		}
		return location;
	}
	
	@GraphQLIgnore
	public Location getLocation() { 
		return location;
	}
	
	public void setLocation(Location location) { 
		this.location = location;
	}
	
	@GraphQLFetcher("previousPeople")
	public List<PersonPositionHistory> loadPreviousPeople() {
		if (previousPeople == null) { 
			this.previousPeople = AnetObjectEngine.getInstance().getPositionDao().getPositionHistory(this);
		}
		return previousPeople;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != Position.class) { 
			return false; 
		}
		Position other = (Position) o;
		return Objects.equals(id, other.getId()) 
			&& Objects.equals(name, other.getName()) 
			&& Objects.equals(code,  other.getCode()) 
			&& Objects.equals(type, other.getType()) 
			&& idEqual(organization, other.getOrganization());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, code, type, organization);
	}
	
	@Override
	public String toString() { 
		return String.format("[id:%s name:%s orgId:%d]", id, name, DaoUtils.getId(organization));
	}
}
