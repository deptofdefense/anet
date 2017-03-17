package mil.dds.anet.search.mssql;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import com.google.common.base.Joiner;

import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.ReportList;
import mil.dds.anet.beans.search.ISearchQuery.SortOrder;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery.ReportSearchSortBy;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.search.IReportSearcher;
import mil.dds.anet.utils.DaoUtils;

public class MssqlReportSearcher implements IReportSearcher {
	
	public ReportList runSearch(ReportSearchQuery query, Handle dbHandle) { 
		StringBuffer sql = new StringBuffer();
		sql.append("/* MssqlReportSearch */ SELECT " + ReportDao.REPORT_FIELDS + "," + PersonDao.PERSON_FIELDS);
		sql.append(", count(*) OVER() AS totalCount "
				+ "FROM reports, people WHERE reports.authorId = people.id "
				+ "AND ");
		
		String commonTableExpression = null;
		Map<String,Object> args = new HashMap<String,Object>();
		List<String> whereClauses = new LinkedList<String>();
		
		ReportList results = new ReportList();
		results.setPageNum(query.getPageNum());
		results.setPageSize(query.getPageSize());
		
		if (query.getAuthorId() != null) { 
			whereClauses.add("reports.authorId = :authorId");
			args.put("authorId", query.getAuthorId());
		}
		
		String text = query.getText();
		if (text != null && text.trim().length() > 0) {
			text = "\"" + text + "*\"";
			whereClauses.add("CONTAINS ((text, intent, keyOutcomes, nextSteps), :text)");
			args.put("text", text);
		}
		
		if (query.getEngagementDateStart() != null) { 
			whereClauses.add("reports.engagementDate >= :startDate");
			args.put("startDate", query.getEngagementDateStart());	
		}
		if (query.getEngagementDateEnd() != null) { 
			whereClauses.add("reports.engagementDate <= :endDate");
			args.put("endDate", query.getEngagementDateEnd());	
		}
		
		if (query.getCreatedAtStart() != null) { 
			whereClauses.add("reports.createdAt >= :startCreatedAt");
			args.put("startCreatedAt", query.getCreatedAtStart());
		}
		if (query.getCreatedAtEnd() != null) { 
			whereClauses.add("reports.createdAt <= :endCreatedAt");
			args.put("endCreatedAt", query.getCreatedAtEnd());
		}
		
		if (query.getReleasedAtStart() != null) { 
			whereClauses.add("reports.releasedAt >= :releasedAtStart");
			args.put("releasedAtStart", query.getReleasedAtStart());
		}
		if (query.getReleasedAtEnd() != null) { 
			whereClauses.add("reports.releasedAt <= :releasedAtEnd");
			args.put("releasedAtEnd", query.getReleasedAtEnd());
		}
		
		if (query.getAttendeeId() != null) { 
			whereClauses.add("reports.id IN (SELECT reportId from reportPeople where personId = :attendeeId)");
			args.put("attendeeId", query.getAttendeeId());
		}
		
		if (query.getPoamId() != null) { 
			whereClauses.add("reports.id IN (SELECT reportId from reportPoams where poamId = :poamId)");
			args.put("poamId", query.getPoamId());
		}
		
		if (query.getAdvisorOrgId() != null) { 
			if (query.isIncludeAdvisorOrgChildren()) { 
				commonTableExpression = "WITH parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :advisorOrgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ")";
				whereClauses.add("reports.advisorOrganizationId IN (SELECT id from parent_orgs)");
			} else { 
				whereClauses.add("reports.advisorOrganizationId = :advisorOrgId");
			}
			args.put("advisorOrgId", query.getAdvisorOrgId());
		}
		
		if (query.getPrincipalOrgId() != null) { 
			if (query.isIncludePrincipalOrgChildren()) { 
				commonTableExpression = "WITH parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :principalOrgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ")";
				whereClauses.add("reports.principalOrganizationId IN (SELECT id from parent_orgs)");
			} else { 
				whereClauses.add("reports.principalOrganizationId = :principalOrgId");
			}
			args.put("principalOrgId", query.getAdvisorOrgId());
		}
		
		if (query.getLocationId() != null) { 
			whereClauses.add("locationId = :locationId");
			args.put("locationId", query.getLocationId());
		}
		
		if (query.getPendingApprovalOf() != null) { 
			whereClauses.add("reports.approvalStepId IN "
				+ "(SELECT approvalStepId from approvers where positionId IN "
				+ "(SELECT id FROM positions where currentPersonId = :approverId))");
			args.put("approverId", query.getPendingApprovalOf());
		}
		
		if (query.getState() != null && query.getState().size() > 0) {
			if (query.getState().size() == 1) { 
				whereClauses.add("reports.state = :state");
				args.put("state", DaoUtils.getEnumId(query.getState().get(0)));
			} else {
				List<String> argNames = new LinkedList<String>();
				for (int i=0;i<query.getState().size();i++) { 
					argNames.add(":state" + i);
					args.put("state" + i, DaoUtils.getEnumId(query.getState().get(i)));
				}
				whereClauses.add("reports.state IN (" + Joiner.on(", ").join(argNames) + ")");
			}
		}
		
		if (whereClauses.size() == 0) { return results; }
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		//Sort Ordering
		sql.append(" ORDER BY ");
		if (query.getSortBy() == null) { query.setSortBy(ReportSearchSortBy.CREATED_AT); }
		switch (query.getSortBy()) {
			case ENGAGEMENT_DATE:
				sql.append("reports.engagementDate");
				break;
			case RELEASED_AT:
				sql.append("reports.releasedAt");
				break;
			case CREATED_AT:
			default:
				sql.append("reports.createdAt");
				break;
		}
		
		if (query.getSortOrder() == null) { query.setSortOrder(SortOrder.DESC); }
		switch (query.getSortOrder()) {
			case ASC:
				sql.append(" ASC ");
				break;
			case DESC:
			default:
				sql.append(" DESC ");
				break;
		}
		
		sql.append(" OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY");
		
		if (commonTableExpression != null) { 
			sql.insert(0, commonTableExpression);
		}
		
		Query<Report> map = dbHandle.createQuery(sql.toString())
				.bindFromMap(args)
				.bind("offset", query.getPageSize() * query.getPageNum())
				.bind("limit", query.getPageSize())
				.map(new ReportMapper());
		return ReportList.fromQuery(map, query.getPageNum(), query.getPageSize());
		
	}
	
}
