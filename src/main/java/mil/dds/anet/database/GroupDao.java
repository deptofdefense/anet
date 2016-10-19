package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.PreparedBatch;
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
		
		Query<Person> membersQuery = dbHandle.createQuery("SELECT people.* " + 
				"FROM people, groupMemberships " + 
				"WHERE groupMemberships.groupId = :groupId " +
				"AND groupMemberships.personId = people.id")
			.bind("groupId", g.getId())
			.map(new PersonMapper());
		List<Person> members = membersQuery.list();
		g.setMembers(members);
		
		return g;		
	}
	
	public Group createNewGroup(Group g) { 
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(
				"INSERT into groups (name) VALUES (:name)")
			.bind("name",g.getName())
			.executeAndReturnGeneratedKeys();
		
		g.setId(((Integer)keys.first().get("last_insert_rowid()")).intValue());
		
		
		if (g.getMembers() != null && g.getMembers().size() > 0 ) { 
			PreparedBatch memberInsertBatch = dbHandle.prepareBatch("INSERT INTO groupMemberships (groupId, personId) VALUES (:groupId, :personId)");
			for (Person p : g.getMembers()) { 
				memberInsertBatch.add()
					.bind("personId", p.getId())
					.bind("groupId",g.getId());
			}
			memberInsertBatch.execute();
		}
		
		return g;
	}
	
	/*
	 * @return: the number of rows updated (should be 1
	 */
	public int updateGroupName(Group g) { 
		return dbHandle.createStatement("UPDATE groups SET name = :name where id = :id")
			.bind("name", g.getName())
			.bind("id", g.getId())
			.execute();
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
	
	public void deleteGroup(Group g) { 
		deleteGroup(g.getId());
	}
	
	public void deleteGroup(int groupId) { 
		dbHandle.createStatement("DELETE FROM groupMemberships WHERE groupId = :groupId")
			.bind("groupId", groupId)
			.execute();
		
		dbHandle.createStatement("DELETE FROM groups where id = :groupId")
			.bind("groupId", groupId)
			.execute();
	}
}
