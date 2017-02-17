package mil.dds.anet.search.sqlite;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.database.mappers.OrganizationMapper;
import mil.dds.anet.search.IOrganizationSearcher;
import mil.dds.anet.utils.DaoUtils;

public class SqliteOrganizationSearcher implements IOrganizationSearcher {

	@Override
	public OrganizationList runSearch(OrganizationSearchQuery query, Handle dbHandle) {
		StringBuilder sql = new StringBuilder("/* SqliteOrganizationSearch */ SELECT " + OrganizationDao.ORGANIZATION_FIELDS
				+ " FROM organizations WHERE organizations.id IN (SELECT organizations.id FROM organizations ");
		Map<String,Object> sqlArgs = new HashMap<String,Object>();
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		OrganizationList result = new OrganizationList();
		result.setPageNum(query.getPageNum());
		result.setPageSize(query.getPageSize());
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) { 
			whereClauses.add("(shortName LIKE '%' || :text || '%' OR longName LIKE '%' || :text || '%' )");
			sqlArgs.put("text", text);
		}
		
		if (query.getType() != null) { 
			whereClauses.add(" organizations.type = :type ");
			sqlArgs.put("type", DaoUtils.getEnumId(query.getType()));
		}
		
		if (query.getParentOrgId() != null) { 
			if (query.getParentOrgRecursively() != null && query.getParentOrgRecursively()) { 
				whereClauses.add("(organizations.parentOrgId IN ("
					+ "WITH RECURSIVE parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :parentOrgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ") SELECT id from parent_orgs) OR organizations.id = :parentOrgId)");
			} else { 
				whereClauses.add("organizations.parentOrgId = :parentOrgId");
			}
			sqlArgs.put("parentOrgId", query.getParentOrgId());
		}
		
		if (whereClauses.size() == 0) { return result; }
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		sql.append(" LIMIT :limit OFFSET :offset)");
		
		List<Organization> list = dbHandle.createQuery(sql.toString())
			.bindFromMap(sqlArgs)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new OrganizationMapper())
			.list();
		
		
		result.setList(list);
		result.setTotalCount(result.getList().size()); // Sqlite cannot do true total counts, so this is a crutch.
		return result;
	}

}
