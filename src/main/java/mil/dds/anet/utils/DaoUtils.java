package mil.dds.anet.utils;

import mil.dds.anet.views.AbstractAnetView;

public class DaoUtils {

	public static Integer getId(AbstractAnetView<?> obj) { 
		if (obj == null) { return null; }
		return obj.getId();
	}
	
}
