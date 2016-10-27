package mil.dds.anet.views.report;

import io.dropwizard.views.View;
import mil.dds.anet.beans.Report;

public class ReportForm extends View {

	Report report;
	
	public ReportForm(Report r) { 
		super("form.mustache");
		this.report = r;
	}
	
	public Report getReport() { 
		return report;
	}
	
}
