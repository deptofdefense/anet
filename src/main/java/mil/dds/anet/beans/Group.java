package mil.dds.anet.beans;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class Group {

	Integer id;
	String name;
	List<Person> members;
	
	public Group() { 
		this.members = Collections.emptyList();
	}
	
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
	public List<Person> getMembers() {
		return members;
	}
	
	public void setMembers(List<Person> members) {
		this.members = members;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != this.getClass()) { 
			return false;
		}
		Group other = (Group) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getName(), name) &&
				Objects.equals(other.getMembers(), members);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, members);
	}
	
}
