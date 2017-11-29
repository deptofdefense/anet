package mil.dds.anet.search.mssql;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;

import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import com.google.common.base.Joiner;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.ReportList;
import mil.dds.anet.beans.search.ISearchQuery.SortOrder;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery.ReportSearchSortBy;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.ReportDao;
import mil.dds.anet.database.mappers.ReportMapper;
import mil.dds.anet.search.IReportSearcher;
import mil.dds.anet.utils.DaoUtils;
import mil.dds.anet.utils.Utils;

public class MssqlReportSearcher implements IReportSearcher {
	
	public ReportList runSearch(ReportSearchQuery query, Handle dbHandle, Person user) { 
		StringBuilder sql = new StringBuilder();
		sql.append("/* MssqlReportSearch */ SELECT *, count(*) OVER() AS totalCount FROM ( ");
		sql.append("SELECT DISTINCT " + ReportDao.REPORT_FIELDS + ", " + PersonDao.PERSON_FIELDS + " ");
		if (query.getIncludeEngagementDayOfWeek()) {
			sql.append(", DATEPART(dw, reports.engagementDate) as engagementDayOfWeek ");
		}
		sql.append("FROM reports "
				+ "LEFT JOIN reportTags ON reportTags.reportId = reports.id "
				+ "LEFT JOIN tags ON reportTags.tagId = tags.id "
				+ ", people "
				+ "WHERE reports.authorId = people.id "
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
			String cleanText = Utils.getSqlServerFullTextQuery(text);
			whereClauses.add("(CONTAINS ((text, intent, keyOutcomes, nextSteps), :containsQuery) "
					+ "OR FREETEXT((text, intent, keyOutcomes, nextSteps), :freetextQuery) "
					+ "OR CONTAINS ((tags.name, tags.description), :containsQuery) "
					+ "OR FREETEXT((tags.name, tags.description), :freetextQuery))");
			args.put("containsQuery", cleanText);
			args.put("freetextQuery", query.getText());
		}
		
		if (query.getEngagementDateStart() != null) { 
			whereClauses.add("reports.engagementDate >= :startDate");
			args.put("startDate", Utils.handleRelativeDate(query.getEngagementDateStart()));	
		}
		if (query.getEngagementDateEnd() != null) { 
			whereClauses.add("reports.engagementDate <= :endDate");
			args.put("endDate", Utils.handleRelativeDate(query.getEngagementDateEnd()));	
		}
		if (query.getEngagementDayOfWeek() != null) {
			whereClauses.add("DATEPART(dw, reports.engagementDate) = :engagementDayOfWeek");
			args.put("engagementDayOfWeek", query.getEngagementDayOfWeek());
		}
		
		if (query.getCreatedAtStart() != null) { 
			whereClauses.add("reports.createdAt >= :startCreatedAt");
			args.put("startCreatedAt", Utils.handleRelativeDate(query.getCreatedAtStart()));
		}
		if (query.getCreatedAtEnd() != null) { 
			whereClauses.add("reports.createdAt <= :endCreatedAt");
			args.put("endCreatedAt", Utils.handleRelativeDate(query.getCreatedAtEnd()));
		}
		
		if (query.getUpdatedAtStart() != null) {
			whereClauses.add("reports.updatedAt >= :updatedAtStart");
			args.put("updatedAtStart", Utils.handleRelativeDate(query.getUpdatedAtStart()));
		}
		if (query.getUpdatedAtEnd() != null) {
			whereClauses.add("reports.updatedAt <= :updatedAtEnd");
			args.put("updatedAtEnd", Utils.handleRelativeDate(query.getUpdatedAtEnd()));
		}

		if (query.getReleasedAtStart() != null) { 
			whereClauses.add("reports.releasedAt >= :releasedAtStart");
			args.put("releasedAtStart", Utils.handleRelativeDate(query.getReleasedAtStart()));
		}
		if (query.getReleasedAtEnd() != null) { 
			whereClauses.add("reports.releasedAt <= :releasedAtEnd");
			args.put("releasedAtEnd", Utils.handleRelativeDate(query.getReleasedAtEnd()));
		}

		if (query.getAttendeeId() != null) { 
			whereClauses.add("reports.id IN (SELECT reportId from reportPeople where personId = :attendeeId)");
			args.put("attendeeId", query.getAttendeeId());
		}
		
		if (query.getAtmosphere() != null) { 
			whereClauses.add("reports.atmosphere = :atmosphere");
			args.put("atmosphere", DaoUtils.getEnumId(query.getAtmosphere()));
		}
		
		if (query.getPoamId() != null) { 
			whereClauses.add("reports.id IN (SELECT reportId from reportPoams where poamId = :poamId)");
			args.put("poamId", query.getPoamId());
		}
		
		if (query.getOrgId() != null) { 
			if (query.getAdvisorOrgId() != null || query.getPrincipalOrgId() != null) { 
				throw new WebApplicationException("Cannot combine orgId with principalOrgId or advisorOrgId parameters", Status.BAD_REQUEST);
			}
			if (query.getIncludeOrgChildren()) { 
				commonTableExpression = "WITH parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :orgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ")";
				whereClauses.add("(reports.advisorOrganizationId IN (SELECT id from parent_orgs) "
						+ "OR reports.principalOrganizationId IN (SELECT id from parent_orgs))");
			} else { 
				whereClauses.add("(reports.advisorOrganizationId = :orgId OR reports.principalOrganizationId = :orgId)");
			}
			args.put("orgId", query.getOrgId());
		}
		
		if (query.getAdvisorOrgId() != null) { 
			if (query.getAdvisorOrgId() == -1) { 
				whereClauses.add("reports.advisorOrganizationId IS NULL");
			} else if (query.getIncludeAdvisorOrgChildren()) { 
				commonTableExpression = "WITH parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :advisorOrgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ")";
				whereClauses.add("reports.advisorOrganizationId IN (SELECT id from parent_orgs)");
			} else  { 
				whereClauses.add("reports.advisorOrganizationId = :advisorOrgId");
			}
			
			args.put("advisorOrgId", query.getAdvisorOrgId());
		}
		
		if (query.getPrincipalOrgId() != null) { 
			if (query.getPrincipalOrgId() == -1) { 
				whereClauses.add("reports.principalOrganizationId IS NULL");
			} else if (query.getIncludePrincipalOrgChildren()) { 
				commonTableExpression = "WITH parent_orgs(id) AS ( "
						+ "SELECT id FROM organizations WHERE id = :principalOrgId "
					+ "UNION ALL "
						+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
					+ ")";
				whereClauses.add("reports.principalOrganizationId IN (SELECT id from parent_orgs)");
			} else { 
				whereClauses.add("reports.principalOrganizationId = :principalOrgId");
			}
			args.put("principalOrgId", query.getPrincipalOrgId());
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
				for (int i = 0;i < query.getState().size();i++) { 
					argNames.add(":state" + i);
					args.put("state" + i, DaoUtils.getEnumId(query.getState().get(i)));
				}
				whereClauses.add("reports.state IN (" + Joiner.on(", ").join(argNames) + ")");
			}
		}
		
		if (query.getCancelledReason() != null) { 
			whereClauses.add("reports.cancelledReason = :cancelledReason");
			args.put("cancelledReason", DaoUtils.getEnumId(query.getCancelledReason()));
		}

		if (query.getTagId() != null) {
			whereClauses.add("reports.id IN (SELECT reportId from reportTags where tagId = :tagId)");
			args.put("tagId", query.getTagId());
		}

		if (query.getAuthorPositionId() != null) {
			// Search for reports authored by people serving in that position at the report's creation date
			whereClauses.add("reports.id IN ( SELECT r.id FROM reports r "
							+ "JOIN peoplePositions pp ON pp.personId = r.authorId "
							+ "  AND pp.createdAt <= r.createdAt "
							+ "LEFT JOIN peoplePositions maxPp ON maxPp.positionId = pp.positionId "
							+ "  AND maxPp.createdAt > pp.createdAt "
							+ "  AND maxPp.createdAt <= r.createdAt "
							+ "WHERE pp.positionId = :authorPositionId "
							+ "  AND maxPp.createdAt IS NULL )");
			args.put("authorPositionId", query.getAuthorPositionId());
		}

		if (query.getAttendeePositionId() != null) {
			// Search for reports attended by people serving in that position at the engagement date
			whereClauses.add("reports.id IN ( SELECT r.id FROM reports r "
							+ "JOIN reportPeople rp ON rp.reportId = r.id "
							+ "JOIN peoplePositions pp ON pp.personId = rp.personId "
							+ "  AND pp.createdAt <= r.engagementDate "
							+ "LEFT JOIN peoplePositions maxPp ON maxPp.positionId = pp.positionId "
							+ "  AND maxPp.createdAt > pp.createdAt "
							+ "  AND maxPp.createdAt <= r.engagementDate "
							+ "WHERE pp.positionId = :attendeePositionId "
							+ "  AND maxPp.createdAt IS NULL )");
			args.put("attendeePositionId", query.getAttendeePositionId());
		}

		if (whereClauses.size() == 0) { return results; }
		
		//Apply a filter to restrict access to other's draft reports
		if (user == null) { 
			whereClauses.add("reports.state != :draftState");
			whereClauses.add("reports.state != :rejectedState");
			args.put("draftState", DaoUtils.getEnumId(ReportState.DRAFT));
			args.put("rejectedState", DaoUtils.getEnumId(ReportState.REJECTED));
		} else { 
			whereClauses.add("((reports.state != :draftState AND reports.state != :rejectedState) OR (reports.authorId = :userId))");
			args.put("draftState", DaoUtils.getEnumId(ReportState.DRAFT));
			args.put("rejectedState", DaoUtils.getEnumId(ReportState.REJECTED));
			args.put("userId", user.getId());
		}
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		sql.append(" ) l");
		
		//Sort Ordering
		sql.append(" ORDER BY ");
		if (query.getSortBy() == null) { query.setSortBy(ReportSearchSortBy.ENGAGEMENT_DATE); }
		// Beware of the sort field names, they have to match what's in the selected fields!
		switch (query.getSortBy()) {
			case ENGAGEMENT_DATE:
				sql.append("reports_engagementDate");
				break;
			case RELEASED_AT:
				sql.append("reports_releasedAt");
				break;
			case CREATED_AT:
			default:
				sql.append("reports_createdAt");
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
		sql.append(", reports_id DESC ");

		if (commonTableExpression != null) { 
			sql.insert(0, commonTableExpression);
		}

		final Query<Report> map = MssqlSearcher.addPagination(query, dbHandle, sql, args)
				.map(new ReportMapper());
		return ReportList.fromQuery(user, map, query.getPageNum(), query.getPageSize());
		
	}
	
}
