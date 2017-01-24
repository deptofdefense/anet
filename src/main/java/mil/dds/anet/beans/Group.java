package mil.dds.anet.beans;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import mil.dds.anet.views.AbstractAnetBean;

public class Group extends AbstractAnetBean {

	String name;
	List<Person> members;
	
	public Group() { 
		this.members = Collections.emptyList();
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public List<Person> getMembers() {
		return members;
	}
	
	public void setMembers(List<Person> members) {
		this.members = members;
	}
	
	public DateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(DateTime createdAt) {
		this.createdAt = createdAt;
	}

	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != this.getClass()) { 
			return false;
		}
		Group other = (Group) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getName(), name) &&
				Objects.equals(other.getMembers(), members) &&
				Objects.equals(other.getCreatedAt(), createdAt);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, members, createdAt);
	}
	
	@Override
	public String toString() { 
		return String.format("Group: %d - %s", id, name);
	}
	
	public static Group create(String name) { 
		Group g = new Group();
		g.setName(name);
		return g;
	}

	public static Group createWithId(Integer id) {
		Group g = new Group();
		g.setId(id);
		g.setLoadLevel(LoadLevel.ID_ONLY);
		return g;
	}
}
