package mil.dds.anet.database.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;

public class MapperUtils {

	public static Integer getInteger(ResultSet rs, String columnName) throws SQLException {
		Object res = rs.getObject(columnName);
		if (res == null) { 
			return null; 
		} else if (res instanceof Integer) { 
			return (Integer) res;
		} else { 
			return null;
		}
	}
	
	public static <T extends Enum<T>> T getEnumIdx(ResultSet rs, String columnName, Class<T> clazz ) throws SQLException {
		Object res = rs.getObject(columnName);
		if (res == null) { return null; } 
		int idx = rs.getInt(columnName);
		
		try { 
			@SuppressWarnings("unchecked")
			T[] values = (T[]) clazz.getMethod("values").invoke(null);
			return values[idx];
		} catch (Exception e) { 
			e.printStackTrace();
			return null;
		}
	}
	
}
