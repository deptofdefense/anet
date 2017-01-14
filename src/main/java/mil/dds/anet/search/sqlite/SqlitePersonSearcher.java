package mil.dds.anet.search.sqlite;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.search.IPersonSearcher;
import mil.dds.anet.utils.DaoUtils;

public class SqlitePersonSearcher implements IPersonSearcher {

	@Override
	public List<Person> runSearch(PersonSearchQuery query, Handle dbHandle) { 
		StringBuilder sql = new StringBuilder("SELECT " + PersonDao.PERSON_FIELDS 
				+ " FROM people WHERE people.id IN (SELECT people.id FROM people ");
		Map<String,Object> sqlArgs = new HashMap<String,Object>();
		
		if (query.getOrgId() != null || query.getLocationId() != null) { 
			sql.append(" LEFT JOIN positions ON people.id = positions.currentPersonId ");
		}
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) { 
			whereClauses.add("(name LIKE '%' || :text || '%' OR emailAddress LIKE '%' || :text || '%' OR biography LIKE '%' || :text || '%')");
			sqlArgs.put("text", text);
		}
		
		
		if (query.getRole() != null) { 
			whereClauses.add(" people.role = :role ");
			sqlArgs.put("role", DaoUtils.getEnumId(query.getRole()));
		}
		
		if (query.getStatus() != null) { 
			whereClauses.add(" people.status = :status ");
			sqlArgs.put("status", DaoUtils.getEnumId(query.getStatus()));
		}
		
		if (query.getCountry() != null && query.getCountry().trim().length() > 0) { 
			whereClauses.add(" people.country LIKE '%' || :country || '%' ");
			sqlArgs.put("country", query.getCountry());
		}
		
		if (query.getPendingVerification() != null) { 
			whereClauses.add(" people.pendingVerification = :pendingVerification ");
			sqlArgs.put("pendingVerification", query.getPendingVerification());
		}
		
		if (query.getOrgId() != null) { 
			if (query.getIncludeChildOrgs() != null && query.getIncludeChildOrgs()) { 
				whereClauses.add(" positions.organizationId IN ( "
					+ "WITH RECURSIVE parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :orgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ") SELECT id from parent_orgs)");
			} else { 
				sql.append(" positions.organizationId = :orgId " );
			}
			sqlArgs.put("orgId", query.getOrgId());
		}
		
		if (query.getLocationId() != null) { 
			whereClauses.add(" positions.locationId = :locationId ");
			sqlArgs.put("locationId", query.getLocationId());
		}
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		sql.append(" LIMIT :limit OFFSET :offset)");
		
		return dbHandle.createQuery(sql.toString())
			.bindFromMap(sqlArgs)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new PersonMapper())
			.list();
	}

	
	
	
}
