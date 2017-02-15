package mil.dds.anet.database;

import mil.dds.anet.beans.lists.AbstractAnetBeanList;

public interface IAnetDao<T> {

	public AbstractAnetBeanList<?> getAll(int pageNum, int pageSize);
	
	public T getById(int id);
	
	public T insert(T obj);
	
	public int update(T obj);
}
