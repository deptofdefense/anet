package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.database.mappers.OrganizationMapper;
import mil.dds.anet.utils.DaoUtils;

public class OrganizationDao implements IAnetDao<Organization> {

	private static String[] fields = {"id", "name", "type", "createdAt", "updatedAt", "parentOrgId"};
	private static String tableName = "organizations";
	public static String ORGANIZATION_FIELDS = DaoUtils.buildFieldAliases(tableName, fields);
	
	Handle dbHandle;
	GroupDao groupDao;
	
	public OrganizationDao(Handle dbHandle, GroupDao groupDao) { 
		this.dbHandle = dbHandle;
		this.groupDao = groupDao;
	}
	
	public List<Organization> getAll(int pageNum, int pageSize) {
		return getAll(pageNum, pageSize, null);
	}
	
	public List<Organization> getAll(int pageNum, int pageSize, OrganizationType type) {
		StringBuilder queryBuilder = new StringBuilder("SELECT " + ORGANIZATION_FIELDS + " from organizations ");
		if (type != null) { 
			queryBuilder.append("AND type = :type ");
		}
		queryBuilder.append("ORDER BY createdAt ASC ");
		if (DaoUtils.isMsSql(dbHandle)) { 
			queryBuilder.append("OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY");
		} else { 
			queryBuilder.append("LIMIT :limit OFFSET :offset");	
		}
		
		return dbHandle.createQuery(queryBuilder.toString())
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.bind("type", DaoUtils.getEnumId(type))
			.map(new OrganizationMapper())
			.list();
	}
	
	public Organization getById(int id) { 
		Query<Organization> query = dbHandle.createQuery(
				"Select " + ORGANIZATION_FIELDS + " from organizations where id = :id")
			.bind("id",id)
			.map(new OrganizationMapper());
		List<Organization> results = query.list();
		return (results.size() == 0) ? null : results.get(0);
	}
	
	public List<Organization> getByParentOrgId(Integer parentId) { 
		String query = (parentId == null) ? "SELECT " + ORGANIZATION_FIELDS + " FROM organizations WHERE parentOrgId IS NULL" : 
			"SELECT " + ORGANIZATION_FIELDS + " FROM organizations WHERE parentOrgId = :parentId";
		return dbHandle.createQuery(query)
			.bind("parentId",parentId)
			.map(new OrganizationMapper())
			.list();
	}
	
	public Organization insert(Organization org) {
		org.setCreatedAt(DateTime.now());
		org.setUpdatedAt(org.getCreatedAt());
		
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO organizations (name, type, createdAt, updatedAt, parentOrgId) " + 
				"VALUES (:name, :type, :createdAt, :updatedAt, :parentOrgId)")
			.bindFromProperties(org)
			.bind("type", DaoUtils.getEnumId(org.getType()))
			.bind("parentOrgId", DaoUtils.getId(org.getParentOrgJson()))
			.executeAndReturnGeneratedKeys();
		
		org.setId(DaoUtils.getGeneratedId(keys));
		return org;
	}
	
	public int update(Organization org) {
		org.setUpdatedAt(DateTime.now());
		int numRows = dbHandle.createStatement("UPDATE organizations "
				+ "SET name = :name, type = :type, updatedAt = :updatedAt, parentOrgid = :parentOrgId where id = :id")
				.bindFromProperties(org)
				.bind("type", DaoUtils.getEnumId(org.getType()))
				.bind("parentOrgId", DaoUtils.getId(org.getParentOrgJson()))
				.execute();
			
		return numRows;
	}
	
	public void deleteAdvisorOrganization(Organization ao) { 
		dbHandle.createStatement("DELETE from advisorOrganizations where id = :id")
			.bind("id", ao.getId())
			.execute();
	}

	public List<Organization> searchByName(String name, OrganizationType type) {
		String sql;
		if (DaoUtils.isMsSql(dbHandle)) { 
			return dbHandle.createQuery("SELECT " + ORGANIZATION_FIELDS 
					+ " FROM organizations "
					+ "WHERE ( CONTAINS (name, :name) OR name LIKE :likeQuery) "
					+ "AND type = :type")
				.bind("type", DaoUtils.getEnumId(type))
				.bind("name", "\"" + name + "*\"")
				.bind("likeQuery", name + "%")
				.map(new OrganizationMapper())
				.list();
		} else { 
			sql = "SELECT " + ORGANIZATION_FIELDS + " FROM organizations WHERE type = :type AND name LIKE '%' || :name || '%'";
			return dbHandle.createQuery(sql)
					.bind("type", DaoUtils.getEnumId(type))
					.bind("name", name)
					.map(new OrganizationMapper())
					.list();
		}
	} 
}
