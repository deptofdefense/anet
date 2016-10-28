package mil.dds.anet.views.billet;

import java.util.List;

import mil.dds.anet.beans.Billet;
import mil.dds.anet.views.AbstractAnetView;

public class BilletListView extends AbstractAnetView<BilletListView> {

	List<Billet> billets;
	
	public BilletListView(List<Billet> billets) { 
		this.billets = billets;
		render("/views/billet/index.mustache");
	}
	
	
	
	
}
