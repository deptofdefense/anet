package mil.dds.anet.utils;

import mil.dds.anet.views.AbstractAnetView;

public class DaoUtils {

	public static Integer getId(AbstractAnetView<?> obj) { 
		if (obj == null) { return null; }
		return obj.getId();
	}
	
	public static Integer getEnumId(Enum<?> o) { 
		if (o == null) { return null; } 
		return o.ordinal();
	}
	
}
