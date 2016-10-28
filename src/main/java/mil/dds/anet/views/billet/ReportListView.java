package mil.dds.anet.views.billet;

import java.util.List;

import mil.dds.anet.beans.Report;
import mil.dds.anet.views.AbstractAnetView;

public class ReportListView extends AbstractAnetView<ReportListView> {

	List<Report> reports;
	
	public ReportListView(List<Report> reports) { 
		this.reports = reports;
		render("/views/report/index.mustache");
	}
	
}
