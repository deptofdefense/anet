package mil.dds.anet.views;

import java.util.List;

public class ObjectListView<T> extends AbstractAnetView<ObjectListView<T>> {

	List<T> list;
	
	public ObjectListView(List<T> list, Class<T> klass) { 
		this.list = list;
		String className = klass.getSimpleName();
        className = Character.toLowerCase(className.charAt(0)) + className.substring(1);
		render("/views/" + className + "/index.ftl");
	}
	
	public List<T> getList() { 
		return list;
	}
}
