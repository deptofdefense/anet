package mil.dds.anet.emails;

import java.util.HashMap;
import java.util.Map;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Report;

public class ReportRejectionEmail extends AnetEmailAction {
	Report report;
	Person rejector;
	Comment comment;
	
	public ReportRejectionEmail() { 
		templateName = "/emails/reportRejection.ftl";
		subject = "ANET Report Rejected";
	}
	
	@Override
	public Map<String, Object> execute() {
		Report r = AnetObjectEngine.getInstance().getReportDao().getById(report.getId());
		rejector = AnetObjectEngine.getInstance().getPersonDao().getById(rejector.getId());
		comment = AnetObjectEngine.getInstance().getCommentDao().getById(comment.getId());
		
		Map<String,Object> context = new HashMap<String,Object>();
		context.put("report", r);
		context.put("rejector", rejector);
		context.put("comment", comment);
		return context;
	}

	public Report getReport() {
		return report;
	}

	public void setReport(Report report) {
		this.report = Report.createWithId(report.getId());
	}

	public Person getRejector() {
		return rejector;
	}

	public void setRejector(Person rejector) {
		this.rejector = rejector;
	}

	public Comment getComment() {
		return comment;
	}

	public void setComment(Comment comment) {
		this.comment = comment;
	}

}
