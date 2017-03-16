package mil.dds.anet.emails;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.Organization.OrganizationType;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportCancelledReason;
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
		templateName = "/emails/rollup.ftl";
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

		ReportGrouping allReports = new ReportGrouping(reports);

		Map<String,Object> context = new HashMap<String,Object>();
		context.put("reports", allReports);
		context.put("cancelledReasons", ReportCancelledReason.values());
		context.put("title", getSubject());
		context.put("comment", comment);
		context.put(SHOW_REPORT_TEXT_FLAG, false);
		return context;
	}

	public static class ReportGrouping {
		String name;
		List<Report> reports;

		public ReportGrouping() {
			this.reports = new LinkedList<Report>();
		}

		public ReportGrouping(List<Report> reports) {
			this.reports = reports;
		}

		public List<Report> getAll() {
			return reports;
		}

		public List<Report> getNonCancelled() {
			return reports.stream().filter(r -> r.getCancelledReason() == null)
					.collect(Collectors.toList());
		}

		public void addReport(Report r) {
			reports.add(r);
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public List<ReportGrouping> getByGrouping(String orgType) {
			return getByGrouping(OrganizationType.valueOf(orgType));
		}

		public List<ReportGrouping> getByGrouping(OrganizationType orgType) {
			Map<Integer, ReportGrouping> orgIdToReports = new HashMap<Integer,ReportGrouping>();
			Map<Integer, Organization> orgIdToTopOrg = buildTopLevelOrgHash(orgType);
			for (Report r : reports) {
				Organization reportOrg = (orgType == OrganizationType.ADVISOR_ORG) ? r.loadAdvisorOrg() : r.loadPrincipalOrg();
				int topOrgId;
				String topOrgName;
				if (reportOrg == null) {
					topOrgId = -1;
					topOrgName = "Other";
				} else {
					Organization topOrg = orgIdToTopOrg.get(reportOrg.getId());
					topOrgId = topOrg.getId();
					topOrgName = topOrg.getShortName();
				}
				ReportGrouping group = orgIdToReports.get(topOrgId);
				if (group == null) {
					group = new ReportGrouping();
					group.setName(topOrgName);
					orgIdToReports.put(topOrgId, group);
				}
				group.addReport(r);
			}
			return orgIdToReports.values().stream()
					.sorted((a, b) -> a.getName().compareTo(b.getName()))
					.collect(Collectors.toList());

		}

		public long getCountByCancelledReason(ReportCancelledReason reason) {
			return reports.stream().filter(r -> reason.equals(r.getCancelledReason())).count();
		}

		public long getCountByCancelledReason(String reason) {
			return getCountByCancelledReason(ReportCancelledReason.valueOf(reason));
		}

		private Map<Integer,Organization> buildTopLevelOrgHash(OrganizationType orgType) {
			OrganizationSearchQuery orgQuery = new OrganizationSearchQuery();
			orgQuery.setPageSize(Integer.MAX_VALUE);
			orgQuery.setType(orgType);
			List<Organization> orgs = AnetObjectEngine.getInstance().getOrganizationDao().search(orgQuery).getList();

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
