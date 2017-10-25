package mil.dds.anet.beans.search;

import com.google.common.base.Objects;

import mil.dds.anet.beans.Person;
import mil.dds.anet.views.AbstractAnetBean;

public class SavedSearch extends AbstractAnetBean {

	public enum SearchObjectType { REPORTS, PEOPLE, POAMS, POSITIONS, ORGANIZATIONS, LOCATIONS }
	
	String name;
	Person owner;
	SearchObjectType objectType;
	String query;
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public Person getOwner() {
		return owner;
	}
	
	public void setOwner(Person owner) {
		this.owner = owner;
	}
	
	public SearchObjectType getObjectType() {
		return objectType;
	}
	
	public void setObjectType(SearchObjectType objectType) {
		this.objectType = objectType;
	}
	
	public String getQuery() {
		return query;
	}
	
	public void setQuery(String query) {
		this.query = query;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o instanceof SavedSearch == false) { 
			return false; 
		}
		SavedSearch other = (SavedSearch) o;
		return Objects.equal(getId(), other.getId())
				&& Objects.equal(name, other.getName())
				&& Objects.equal(owner, other.getOwner())
				&& Objects.equal(objectType, other.getObjectType())
				&& Objects.equal(query, other.getQuery());
	}
	
	@Override
	public String toString() { 
		return String.format("SavedSearch[id:%d, name:%s, query:%s, owner:%d]", 
				getId(), name, query, owner.getId());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hashCode(id, name, owner, objectType, query);
	}
}
