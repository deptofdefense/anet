package mil.dds.anet.search.sqlite;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PoamList;
import mil.dds.anet.beans.search.PoamSearchQuery;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.search.IPoamSearcher;
import mil.dds.anet.utils.DaoUtils;
import mil.dds.anet.utils.Utils;

public class SqlitePoamSearcher implements IPoamSearcher {

	@Override
	public PoamList runSearch(PoamSearchQuery query, Handle dbHandle) {
		StringBuilder sql = new StringBuilder("/* SqlitePoamSearch */ SELECT poams.* FROM poams");
		Map<String,Object> args = new HashMap<String,Object>();
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		PoamList result =  new PoamList();
		result.setPageNum(query.getPageNum());
		result.setPageSize(query.getPageSize());
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) { 
			whereClauses.add("(longName LIKE '%' || :text || '%' OR shortName LIKE '%' || :text || '%')");
			args.put("text", Utils.getSqliteFullTextQuery(text));
		}
		
		if (query.getResponsibleOrgId() != null) { 
			whereClauses.add("organizationId = :orgId");
			args.put("orgId", query.getResponsibleOrgId());
		}
		
		if (query.getCategory() != null) { 
			whereClauses.add("category = :category");
			args.put("category", query.getCategory());
		}
		
		if (query.getStatus() != null) { 
			whereClauses.add("status = :status");
			args.put("status", DaoUtils.getEnumId(query.getStatus()));
		}
		
		if (whereClauses.size() == 0) { return result; }
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		sql.append(" ORDER BY shortName ASC LIMIT :limit OFFSET :offset");
		
		result.setList(dbHandle.createQuery(sql.toString())
			.bindFromMap(args)
			.bind("offset", query.getPageSize() * query.getPageNum())
			.bind("limit", query.getPageSize())
			.map(new PoamMapper())
			.list());
		result.setTotalCount(result.getList().size()); // Sqlite cannot do true total counts, so this is a crutch.
		return result;
	}
	
}
