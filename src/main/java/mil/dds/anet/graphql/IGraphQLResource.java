package mil.dds.anet.graphql;

public interface IGraphQLResource {

	public String getDescription();
	
	public Class<? extends IGraphQLBean> getBeanClass();
	
	public Class<?> getBeanListClass();
	
}
