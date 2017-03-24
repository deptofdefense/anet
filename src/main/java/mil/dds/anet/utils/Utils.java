package mil.dds.anet.utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Consumer;
import java.util.stream.Collectors;

import javax.annotation.Nullable;

import mil.dds.anet.beans.Organization;
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
		String cleanText = text.trim().replaceAll("[\"*]", "");
		if (text.endsWith("*")) { 
			cleanText = "\"" + cleanText + "*\"";
		} else { 
			cleanText = "FORMSOF(INFLECTIONAL, \"" + cleanText + "\")";
		}
		return cleanText;
	}
	
	
	/**
	 * Just remove the * 
	 */
	public static String getSqliteFullTextQuery(String text) { 
		return text.trim().replaceAll("[\"*]", "");
	}

	/** 
	 * Prepares text to be used in a LIKE query in SQL. 
	 * Removes the * at the end. 
	 */
	public static String prepForLikeQuery(String text) {
		return text.trim().replaceAll("[\"*]", "");
	}

	/**
	 * Given a list of organizations and a topParentId, this function maps all of the organizations to their highest parent
	 * within this list excluding the topParent.  This is used to generate graphs/tables that bubble things up to their highest parent
	 * 
	 * This is used in the daily rollup graphs. 
	 */
	public static Map<Integer, Organization> buildParentOrgMapping(List<Organization> orgs, @Nullable Integer topParentId) {
		Map<Integer,Organization> result = new HashMap<Integer,Organization>();
		Map<Integer,Organization> orgMap = new HashMap<Integer,Organization>();

		for (Organization o : orgs) {
			orgMap.put(o.getId(), o);
		}

		for (Organization o : orgs) {
			int curr = o.getId();
			Integer parentId = DaoUtils.getId(o.getParentOrg());
			while (Objects.equals(parentId,topParentId) == false && orgMap.containsKey(parentId)) {
				curr = parentId;
				parentId = DaoUtils.getId(orgMap.get(parentId).getParentOrg());
			}
			result.put(o.getId(), orgMap.get(curr));
		}

		return result;
	}
}
