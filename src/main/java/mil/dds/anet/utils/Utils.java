package mil.dds.anet.utils;

import java.util.Objects;

import mil.dds.anet.views.AbstractAnetBean;

public class Utils {

	public static boolean idEqual(AbstractAnetBean a, AbstractAnetBean b) { 
		if (a == null && b == null) { return true; } 
		if (a == null || b == null) { return false; } 
		return Objects.equals(a.getId(), b.getId());
	}
	
}
