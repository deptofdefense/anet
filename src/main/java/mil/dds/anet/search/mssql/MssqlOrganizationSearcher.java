package mil.dds.anet.search.mssql;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.database.mappers.OrganizationMapper;
import mil.dds.anet.search.IOrganizationSearcher;
import mil.dds.anet.utils.DaoUtils;

public class MssqlOrganizationSearcher implements IOrganizationSearcher {

	@Override
	public OrganizationList runSearch(OrganizationSearchQuery query, Handle dbHandle) {
		StringBuilder sql = new StringBuilder("SELECT " + OrganizationDao.ORGANIZATION_FIELDS
				+ ", count(*) OVER() AS totalCount "
				+ "FROM organizations WHERE organizations.id IN (SELECT organizations.id FROM organizations ");
		Map<String,Object> sqlArgs = new HashMap<String,Object>();
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		OrganizationList result = new OrganizationList();
		result.setPageNum(query.getPageNum());
		result.setPageSize(query.getPageSize());
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) {
			whereClauses.add("(CONTAINS((shortName, longName), :text) OR  shortName LIKE :likeQuery)");
			sqlArgs.put("text", "\"" + text + "*\"");
			sqlArgs.put("likeQuery", text + "%");
		}
		
		if (query.getType() != null) { 
			whereClauses.add(" organizations.type = :type ");
			sqlArgs.put("type", DaoUtils.getEnumId(query.getType()));
		}
		
		if (whereClauses.size() == 0) { 
			return result;
		}
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		sql.append(" ORDER BY createdAt DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY)");
		
		Query<Organization> sqlQuery = dbHandle.createQuery(sql.toString())
			.bindFromMap(sqlArgs)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new OrganizationMapper());
		result.setList(sqlQuery.list());
		if (result.getList().size() >  0) { 
			result.setTotalCount((Integer) sqlQuery.getContext().getAttribute("totalCount"));
		} else { 
			result.setTotalCount(0);
		}
		return result;
	}
	
}
