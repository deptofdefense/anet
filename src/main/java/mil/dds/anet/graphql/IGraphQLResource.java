package mil.dds.anet.graphql;

import mil.dds.anet.views.AbstractAnetBean;

public interface IGraphQLResource {

	public String getDescription();
	public Class<? extends AbstractAnetBean> getBeanClass();
	
}
