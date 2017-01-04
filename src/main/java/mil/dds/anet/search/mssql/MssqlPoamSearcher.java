package mil.dds.anet.search.mssql;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.search.PoamSearchQuery;
import mil.dds.anet.database.mappers.PoamMapper;
import mil.dds.anet.search.IPoamSearcher;

public class MssqlPoamSearcher implements IPoamSearcher {

	@Override
	public List<Poam> runSearch(PoamSearchQuery query, Handle dbHandle) {
		StringBuilder sql = new StringBuilder("SELECT poams.* FROM poams");
		Map<String,Object> args = new HashMap<String,Object>();
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		
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
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		
		return dbHandle.createQuery(sql.toString())
			.bindFromMap(args)
			.map(new PoamMapper())
			.list();
	}
	
}
