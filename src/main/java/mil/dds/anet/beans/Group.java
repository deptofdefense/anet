package mil.dds.anet.beans;

import java.util.List;

public class Group {

	int id;
	String name;
	List<Person> members;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
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
	
}
