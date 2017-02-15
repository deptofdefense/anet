package mil.dds.anet.search.mssql;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PoamList;
import mil.dds.anet.beans.search.PoamSearchQuery;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.search.IPoamSearcher;

public class MssqlPoamSearcher implements IPoamSearcher {

	@Override
	public PoamList runSearch(PoamSearchQuery query, Handle dbHandle) {
		StringBuilder sql = new StringBuilder("/* MssqlPoamSearch */ SELECT poams.*, COUNT(*) OVER() AS totalCount FROM poams");
		Map<String,Object> args = new HashMap<String,Object>();
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		PoamList result =  new PoamList();
		result.setPageNum(query.getPageNum());
		result.setPageSize(query.getPageSize());
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) { 
			whereClauses.add("(CONTAINS((longName), :text) OR shortName LIKE :likeQuery)");
			args.put("text", "\"" + text + "*\"");
			args.put("likeQuery", text + "%");
		}
		
		if (query.getResponsibleOrgId() != null) { 
			whereClauses.add("organizationId = :orgId");
			args.put("orgId", query.getResponsibleOrgId());
		}
		
		if (query.getCategory() != null) { 
			whereClauses.add("category = :category");
			args.put("category", query.getCategory());
		}
		
		if (whereClauses.size() == 0) { return result; }
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		sql.append(" ORDER BY createdAt DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY");
		
		Query<Poam> sqlQuery = dbHandle.createQuery(sql.toString())
			.bindFromMap(args)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new PoamMapper());
		result.setList(sqlQuery.list());
		if (result.getList().size() > 0) { 
			result.setTotalCount((Integer) sqlQuery.getContext().getAttribute("totalCount"));
		} else { 
			result.setTotalCount(0);
		}
		return result;
	}
	
}
