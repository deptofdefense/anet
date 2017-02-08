package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.SavedSearch;
import mil.dds.anet.database.mappers.SavedSearchMapper;
import mil.dds.anet.utils.DaoUtils;

public class SavedSearchDao implements IAnetDao<SavedSearch> {

	Handle dbHandle;
	
	public SavedSearchDao(Handle h) { 
		this.dbHandle = h;
	}
	
	@Override
	public List<SavedSearch> getAll(int pageNum, int pageSize) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			sql = "SELECT * FROM savedSearches ORDER BY createdAt ASC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
		} else { 
			sql = "SELECT * from savedSearches ORDER BY createdAt ASC LIMIT :limit OFFSET :offset";
		}
		
		return dbHandle.createQuery(sql)
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new SavedSearchMapper())
			.list();
	}
	
	@Override
	public SavedSearch getById(int id) { 
		return dbHandle.createQuery("SELECT * from savedSearches where id = :id")
				.bind("id", id)
				.map(new SavedSearchMapper())
				.first();
	}

	public List<SavedSearch> getSearchesByOwner(Person owner) { 
		return dbHandle.createQuery("SELECT * FROM savedSearches WHERE ownerId = :ownerId")
			.bind("ownerId", owner.getId())
			.map(new SavedSearchMapper())
			.list();
	}
	
	@Override
	public SavedSearch insert(SavedSearch obj) {
		obj.setCreatedAt(DateTime.now());
		GeneratedKeys<Map<String, Object>> keys = dbHandle.createStatement("INSERT INTO savedSearches "
				+ "(ownerId, name, objectType, query) "
				+ "VALUES (:ownerId, :name, :objectType, :query)")
			.bindFromProperties(obj)
			.bind("ownerId", obj.getOwner().getId())
			.bind("objectType", DaoUtils.getEnumId(obj.getObjectType()))
			.executeAndReturnGeneratedKeys();
		obj.setId(DaoUtils.getGeneratedId(keys));
		return obj;
	}

	@Override
	public int update(SavedSearch obj) {
		return dbHandle.createStatement("UPDATE savedSearches "
				+ "SET name = :name, objectType = :objectType, query = :query "
				+ "WHERE id = :id")
			.bindFromProperties(obj)
			.execute();
	}
	
}
