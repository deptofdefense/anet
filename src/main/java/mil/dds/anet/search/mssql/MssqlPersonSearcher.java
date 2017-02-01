package mil.dds.anet.search.mssql;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import com.google.common.collect.ImmutableList;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.mappers.PersonMapper;
import mil.dds.anet.search.IPersonSearcher;
import mil.dds.anet.utils.DaoUtils;

public class MssqlPersonSearcher implements IPersonSearcher {

	@Override
	public List<Person> runSearch(PersonSearchQuery query, Handle dbHandle) { 
		StringBuilder sql = new StringBuilder("SELECT " + PersonDao.PERSON_FIELDS 
				+ " FROM people WHERE people.id IN (SELECT people.id FROM people ");
		Map<String,Object> sqlArgs = new HashMap<String,Object>();
		String commonTableExpression = null;
		
		if (query.getOrgId() != null || query.getLocationId() != null) { 
			sql.append(" LEFT JOIN positions ON people.id = positions.currentPersonId ");
		}
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) { 
			text = "\"" + text + "*\"";
			whereClauses.add("CONTAINS ((name, emailAddress, biography), :text)");
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
				commonTableExpression = "WITH parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :orgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ") ";
				whereClauses.add(" positions.organizationId IN (SELECT id from parent_orgs)");
			} else { 
				whereClauses.add(" positions.organizationId = :orgId " );
			}
			sqlArgs.put("orgId", query.getOrgId());
		}
		
		if (query.getLocationId() != null) { 
			whereClauses.add(" positions.locationId = :locationId ");
			sqlArgs.put("locationId", query.getLocationId());
		}
		
		if (whereClauses.size() == 0) { return ImmutableList.of(); }
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		sql.append(" ORDER BY people.createdAt DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY)");
		
		if (commonTableExpression != null) { 
			sql.insert(0, commonTableExpression);
		}
		
		return dbHandle.createQuery(sql.toString())
			.bindFromMap(sqlArgs)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new PersonMapper())
			.list();
	}

	
	
}
