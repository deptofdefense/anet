package mil.dds.anet.graphql;

public interface IGraphQLResource {

	/*
	 * Configuration to tell GraphQL the types that this class returns.
	 * 
	 *  GraphQL fields must have a single type, so resources are broken out into two groups
	 *  - methods that return a single bean (ie getById)
	 *  - methods that return a list of that bean (ie getAll)
	 *  
	 *  These methods below tell GraphQL which types to expect or this resource. 
	 */
	
	public String getDescription();
	
	public Class<? extends IGraphQLBean> getBeanClass();
	
	public Class<?> getBeanListClass();
	
}
