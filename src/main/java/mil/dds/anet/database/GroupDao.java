package mil.dds.anet.database;

import java.util.List;

import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;

public class GroupDao {

	Handle dbHandle;
	
	public GroupDao(Handle h) { 
		this.dbHandle = h;
	}
	
	public Group getGroupByid(int id) { 
		Query<Group> query = dbHandle.createQuery("select * from groups where id = :id")
				.bind("id", id)
				.map(new GroupMapper());
		
		List<Group> groups = query.list();
		if (groups.size() == 0) { return null; } 
		Group g = groups.get(0);
		
		Query<Person> membersQuery = dbHandle.createQuery("SELECT people.id, people.lastName, people.firstName " + 
				"FROM people, groupMemberships " + 
				"WHERE groupMemberships.groupId = :groupId " +
				"AND groupMemberships.personId = people.id")
			.bind("groupId", g.getId())
			.map(new PersonMapper());
		List<Person> members = membersQuery.list();
		g.setMembers(members);
		
		return g;		
	}
	
	public void updateGroup(Group g) { 
		
	}
	
	public void addPersonToGroup(Group g, Person p) {
		addPersonToGroup(g.getId(), p.getId());
	}
	
	public void addPersonToGroup(int groupId, int personId) { 
		dbHandle.createStatement("INSERT INTO groupMemberships " +
				"(groupId, personId) VALUES (:groupId, :personId)")
			.bind("groupId", groupId)
			.bind("personId", personId)
			.execute();
	}
	
	public void removePersonFromGroup(Group g, Person p) { 
		removePersonFromGroup(g.getId(), p.getId());
	}
	
	public void removePersonFromGroup(int groupId, int personId) { 
		dbHandle.createStatement("DELETE FROM groupMemberships " +
				"WHERE groupId = :groupId AND personId = :personId;")
			.bind("groupId", groupId)
			.bind("personId", personId)
			.execute();
	}
}
