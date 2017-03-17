package mil.dds.anet.utils;

import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;

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
	
	public static <T extends AbstractAnetBean> T getById(List<T> list, Integer id) { 
		return list.stream().filter(el -> Objects.equals(id, el.getId())).findFirst().orElse(null);
	}
	
	/*
	 * Performs a diff of the two lists of elements
	 * For each element that is in newElements but is not in oldElements it will call addFunc
	 * For each element that is in oldElements but is not in newElements, it will call removeFunc
	 */
	public static <T extends AbstractAnetBean> void addRemoveElementsById(List<T> oldElements, List<T> newElements,
			Consumer<T> addFunc, Consumer<Integer> removeFunc) { 
		List<Integer> existingIds = oldElements.stream().map(p -> p.getId()).collect(Collectors.toList());			
		for (T newEl : newElements) { 
			if (existingIds.remove(newEl.getId()) == false) { 
				//Add this element
				addFunc.accept(newEl);
			}
		}
		
		//Now remove all items in existingIds. 
		for (Integer id : existingIds) {
			removeFunc.accept(id);
		}
	}
	
	public static <T> T orIfNull(T value, T ifNull) { 
		if (value == null) { 
			return ifNull;
		} else { 
			return value; 
		}
	}

	
	/**
	 * Converts a text search query into a SQL Server Full Text query. 
	 * If the text ends with a * then we do a prefix match on the string
	 * else we do an inflectional match. 
	 */
	public static String getSqlServerFullTextQuery(String text) {
		String cleanText = text.trim().replaceAll("\\p{Punct}", "");
		if (text.endsWith("*")) { 
			cleanText = "\"" + cleanText + "*\"";
		} else { 
			cleanText = "FORMSOF(INFLECTIONAL, \"" + cleanText + "\")";
		}
		return cleanText;
	}
}
