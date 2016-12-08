package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.PreparedBatch;
import org.skife.jdbi.v2.Query;
import org.skife.jdbi.v2.sqlobject.customizers.RegisterMapper;

import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.mappers.GroupMapper;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.utils.DaoUtils;

@RegisterMapper(GroupMapper.class)
public class GroupDao implements IAnetDao<Group> {

	Handle dbHandle;
	
	public GroupDao(Handle h) { 
		this.dbHandle = h;
	}
	
	@Override
	public List<Group> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT * FROM groups ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT * from groups ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		Query<Group> query = dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new GroupMapper());
		return query.list();
	}
	@Override
	public Group getById(int id) { 
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
	
	@Override
	public Group insert(Group g) { 
		g.setCreatedAt(DateTime.now());
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement(
				"INSERT into groups (name, createdAt) VALUES (:name, :createdAt)")
			.bind("name",g.getName())
			.bind("createdAt", g.getCreatedAt())
			.executeAndReturnGeneratedKeys();
		g.setId(DaoUtils.getGeneratedId(keys));
		
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
	@Override
	public int update(Group g) { 
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
	
	public int deleteGroup(Group g) { 
		return deleteGroup(g.getId());
	}
	
	public int deleteGroup(int groupId) { 
		dbHandle.createStatement("DELETE FROM groupMemberships WHERE groupId = :groupId")
			.bind("groupId", groupId)
			.execute();
		
		int numRows = dbHandle.createStatement("DELETE FROM groups where id = :groupId")
			.bind("groupId", groupId)
			.execute();
		return numRows;
	}

	public List<Group> searchGroupName(String query) {
		return dbHandle.createQuery("SELECT * FROM groups WHERE name LIKE '%' || :query || '%'")
			.bind("query", query)
			.map(new GroupMapper())
			.list();
	}
}
