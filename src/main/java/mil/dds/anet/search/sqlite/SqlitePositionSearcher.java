package mil.dds.anet.search.sqlite;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import com.google.common.collect.ImmutableList;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.database.PositionDao;
import mil.dds.anet.database.mappers.PositionMapper;
import mil.dds.anet.search.IPositionSearcher;
import mil.dds.anet.utils.DaoUtils;

public class SqlitePositionSearcher implements IPositionSearcher {
	
	@Override
	public List<Position> runSearch(PositionSearchQuery query, Handle dbHandle) {
		StringBuilder sql = new StringBuilder("SELECT " + PositionDao.POSITIONS_FIELDS 
				+ " FROM positions WHERE positions.id IN (SELECT positions.id FROM positions ");
		Map<String,Object> sqlArgs = new HashMap<String,Object>();
		String commonTableExpression = null;
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) {
			whereClauses.add("(name LIKE '%' || :text || '%')");
			sqlArgs.put("text", text);
		}
		
		if (query.getType() != null) { 
			whereClauses.add("positions.type = :type");
			sqlArgs.put("type", DaoUtils.getEnumId(query.getType()));
		}
		
		if (query.getOrganizationId() != null) { 
			if (query.getIncludeChildrenOrgs() != null && query.getIncludeChildrenOrgs()) { 
				commonTableExpression = "WITH RECURSIVE parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :orgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ") ";
				whereClauses.add(" positions.organizationId IN (SELECT id from parent_orgs)");
			} else { 
				whereClauses.add("positions.organizationId = :orgId");
			}
			sqlArgs.put("orgId", query.getOrganizationId());
		}
		
		if (query.getIsFilled() != null) {
			if (query.getIsFilled()) { 
				whereClauses.add("positions.currentPersonId IS NOT NULL");
			} else { 
				whereClauses.add("positions.currentPersonId IS NULL");
			}
		}
		
		if (query.getLocationId() != null) { 
			whereClauses.add("positions.locationId = :locationId");
			sqlArgs.put("locationId", query.getLocationId());
		}
		
		if (whereClauses.size() == 0) { return ImmutableList.of(); }
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		sql.append(" LIMIT :limit OFFSET :offset)");
		
		if (commonTableExpression != null) { 
			sql.insert(0, commonTableExpression);
		}
		
		return dbHandle.createQuery(sql.toString())
			.bindFromMap(sqlArgs)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new PositionMapper())
			.list();
	}
}
