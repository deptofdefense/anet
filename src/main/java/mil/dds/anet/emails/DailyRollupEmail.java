package mil.dds.anet.emails;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import com.google.common.collect.Sets;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.search.ISearchQuery.SortOrder;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery.ReportSearchSortBy;
import mil.dds.anet.utils.DaoUtils;

public class DailyRollupEmail extends AnetEmailAction {

	public static DateTimeFormatter dtf = DateTimeFormat.forPattern("dd MMM YYYY");
	public static String SHOW_REPORT_TEXT_FLAG = "showReportText";

	DateTime startDate;
	DateTime endDate;
	String comment;

	public DailyRollupEmail() {
		templateName = "/emails/rollup_simple.ftl";
	}

	@Override
	public String getSubject() {
		return "Daily Rollup for " + dtf.print(endDate);
	}

	@Override
	public Map<String, Object> execute() {
		ReportSearchQuery query = new ReportSearchQuery();
		query.setPageSize(Integer.MAX_VALUE);
		query.setReleasedAtStart(startDate);
		query.setReleasedAtEnd(endDate);
		query.setSortBy(ReportSearchSortBy.ENGAGEMENT_DATE);
		query.setSortOrder(SortOrder.DESC);
		List<Report> reports = AnetObjectEngine.getInstance().getReportDao().search(query).getList();

		OrganizationSearchQuery orgQuery = new OrganizationSearchQuery();
		orgQuery.setPageSize(Integer.MAX_VALUE);
		orgQuery.setType(OrganizationType.PRINCIPAL_ORG);
		List<Organization> principalOrgs = AnetObjectEngine.getInstance().getOrganizationDao().search(orgQuery).getList();
		Map<Integer,Organization> orgIdToTopOrg = buildTopLevelOrgHash(principalOrgs);

		Set<Organization> topLevelOrgs = Sets.newHashSet(orgIdToTopOrg.values());
		List<Report> otherReports = new LinkedList<Report>();
		Map<Integer, List<Report>> reportsByOrg = new HashMap<Integer, List<Report>>();
		topLevelOrgs.stream().forEach(o -> reportsByOrg.put(o.getId(), new LinkedList<Report>()));

		Map<String, Integer> cancelledByOrgAndReason = new HashMap<String, Integer>();
		Map<String, Integer> cancelledByReason = new HashMap<String, Integer>();

		for (Report r : reports) {
			Organization principalOrg = r.loadPrincipalOrg();
			if (principalOrg == null) {
				otherReports.add(r);
			} else {
				reportsByOrg.get(orgIdToTopOrg.get(principalOrg.getId()).getId()).add(r);

				if (r.getCancelledReason() != null) {
					String reason = "" + r.getCancelledReason().ordinal();

					Integer currentValue = cancelledByReason.get(reason);
					if (currentValue == null) {
						currentValue = 0;
					}
					cancelledByReason.put(reason, currentValue + 1);

					String key = principalOrg.getId() + "-" + reason;
					currentValue = cancelledByOrgAndReason.get(key);
					if (currentValue == null) {
						currentValue = 0;
					}
					cancelledByOrgAndReason.put(key, currentValue + 1);
				}
			}
		}

		Map<String,Object> context = new HashMap<String,Object>();
		context.put("reports", reports);
		context.put("topLevelOrgs", topLevelOrgs);
		context.put("reportsByOrg", reportsByOrg);
		context.put("otherReports", otherReports);
		context.put("cancelledByOrgAndReason", cancelledByOrgAndReason);
		context.put("cancelledByReason", cancelledByReason);
		context.put("title", getSubject());
		context.put(SHOW_REPORT_TEXT_FLAG, false);
		return context;
	}

	private Map<Integer,Organization> buildTopLevelOrgHash(List<Organization> orgs) {
		Map<Integer,Organization> result = new HashMap<Integer,Organization>();
		Map<Integer,Organization> orgMap = new HashMap<Integer,Organization>();

		for (Organization o : orgs) {
			orgMap.put(o.getId(), o);
		}

		for (Organization o : orgs) {
			int curr = o.getId();
			Integer parentId = DaoUtils.getId(orgMap.get(o.getId()).getParentOrg());
			while (parentId != null) {
				curr = parentId;
				parentId = DaoUtils.getId(orgMap.get(parentId).getParentOrg());
			}
			result.put(o.getId(), orgMap.get(curr));
		}

		return result;
	}

	public DateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(DateTime startDate) {
		this.startDate = startDate;
	}

	public DateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(DateTime endDate) {
		this.endDate = endDate;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}


}
