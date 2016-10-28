package mil.dds.anet.database;

import java.util.List;

public interface IAnetDao<T> {

	public List<T> getAll(int pageNum, int pageSize);
	
	public T getById(int id);
	
	public T insert(T obj);
	
	public int update(T obj);
}
