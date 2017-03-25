package mil.dds.anet.threads;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.Handle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.base.Joiner;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.emails.FutureEngagementUpdated;
import mil.dds.anet.threads.AnetEmailWorker.AnetEmail;
import mil.dds.anet.utils.DaoUtils;

public class FutureEngagementWorker implements Runnable {

	Handle handle;
	
	private Logger logger = LoggerFactory.getLogger(FutureEngagementWorker.class);
	
	public FutureEngagementWorker(Handle dbHandle) { 
		this.handle = dbHandle;
	}
	
	@Override
	public void run() {
		logger.debug("Future Engagement Worker waking up to check for Future Engagements");
		try {
			runInternal();
		} catch (Throwable e) { 
			//CAnnot let this thread die. Otherwise ANET will stop checking for future engagements. 
			e.printStackTrace();
		}
	}
	
	private void runInternal() { 
		//Get a list of all FUTURE and engagementDate < today reports, and their authors
		ReportSearchQuery query = new ReportSearchQuery();
		query.setPageSize(Integer.MAX_VALUE);
		query.setState(Collections.singletonList(ReportState.FUTURE));
		DateTime endOfToday = DateTime.now().withHourOfDay(23).withMinuteOfHour(59).withSecondOfMinute(59);
		query.setEngagementDateEnd(endOfToday);
		List<Report> reports = AnetObjectEngine.getInstance().getReportDao().search(query).getList();
		
		Map<String,Object> sqlBindArgs = new HashMap<String,Object>();
		List<String> reportIdBinds = new LinkedList<String>();
		int i = 0;
		
		//send them all emails to let them know we updated their report. 
		for (Report r : reports) { 
			try { 
				AnetEmail email = new AnetEmail();
				FutureEngagementUpdated action = new FutureEngagementUpdated();
				action.setReport(r);
				email.setAction(action);
				email.setToAddresses(Collections.singletonList(r.loadAuthor().getEmailAddress()));
				AnetEmailWorker.sendEmailAsync(email);
				
				sqlBindArgs.put("report" + i, r.getId());
				reportIdBinds.add(":report" + i);
			} catch (Exception e) { 
				e.printStackTrace();
			}
		}
		
		sqlBindArgs.put("future", DaoUtils.getEnumId(ReportState.FUTURE));
		sqlBindArgs.put("draft", DaoUtils.getEnumId(ReportState.DRAFT));
		sqlBindArgs.put("today", endOfToday);
		String reportIdBind = "(" + Joiner.on(',').join(reportIdBinds) + ")";
		
		//update the reports
		if (reportIdBinds.size() > 0) { 
			handle.createStatement("/* FutureEngagementUpdate */ UPDATE reports SET state = :draft "
					+ "WHERE state = :future "
					+ "AND engagementDate < :today "
					+ "AND reports.id IN " + reportIdBind)
				.bindFromMap(sqlBindArgs)
				.execute();
		}
	}

}
