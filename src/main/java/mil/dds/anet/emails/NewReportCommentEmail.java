package mil.dds.anet.emails;

import java.util.HashMap;
import java.util.Map;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Report;

public class NewReportCommentEmail extends AnetEmailAction {
	Report report;
	Comment comment;
	
	public NewReportCommentEmail() { 
		templateName = "/emails/newReportComment.ftl";
		subject = "New Comment on your ANET Report";
	}
	
	@Override
	public Map<String, Object> execute() {
		Report r = AnetObjectEngine.getInstance().getReportDao().getById(report.getId());
		comment = AnetObjectEngine.getInstance().getCommentDao().getById(comment.getId());
		
		Map<String,Object> context = new HashMap<String,Object>();
		context.put("report", r);
		context.put("comment", comment);
		return context;
	}

	public Report getReport() {
		return report;
	}

	public void setReport(Report report) {
		this.report = Report.createWithId(report.getId());
	}

	public Comment getComment() {
		return comment;
	}

	public void setComment(Comment comment) {
		this.comment = Comment.createWithId(comment.getId());
	}

}
