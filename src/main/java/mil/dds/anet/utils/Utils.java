package mil.dds.anet.utils;

import java.util.List;
import java.util.Objects;

import mil.dds.anet.views.AbstractAnetBean;

public class Utils {

	public static boolean idEqual(AbstractAnetBean a, AbstractAnetBean b) { 
		if (a == null && b == null) { return true; } 
		if (a == null || b == null) { return false; } 
		return Objects.equals(a.getId(), b.getId());
	}
	
	public static boolean containsById(List<AbstractAnetBean> list, int id) { 
		for (AbstractAnetBean el : list) { 
			if (el.getId().equals(id)) { return true; } 
		}
		return false; 
	}
	
}
