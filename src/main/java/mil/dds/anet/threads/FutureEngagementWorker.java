package mil.dds.anet.threads;

import java.lang.invoke.MethodHandles;
import java.util.Collections;
import java.util.List;

import org.joda.time.DateTime;
import org.skife.jdbi.v2.Handle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.emails.FutureEngagementUpdated;
import mil.dds.anet.threads.AnetEmailWorker.AnetEmail;
import mil.dds.anet.utils.DaoUtils;

public class FutureEngagementWorker implements Runnable {

	private static final Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

	Handle handle;
	
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
			logger.error("Exception in run()", e);
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
		
		//send them all emails to let them know we updated their report. 
		for (Report r : reports) { 
			try { 
				AnetEmail email = new AnetEmail();
				FutureEngagementUpdated action = new FutureEngagementUpdated();
				action.setReport(r);
				email.setAction(action);
				email.setToAddresses(Collections.singletonList(r.loadAuthor().getEmailAddress()));
				AnetEmailWorker.sendEmailAsync(email);
						
				handle.execute("/* UpdateFutureEngagement */ UPDATE reports SET state = ? "
						+ "WHERE id = ?", DaoUtils.getEnumId(ReportState.DRAFT), r.getId());
			} catch (Exception e) { 
				logger.error("Exception when updating", e);
			}
		}
		
	}

}
