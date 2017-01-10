package mil.dds.anet.database;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.Handle;

import mil.dds.anet.beans.AdminSetting;
import mil.dds.anet.database.mappers.AdminSettingMapper;

public class AdminDao {

	public static enum AdminSettingKeys { 
		SECURITY_BANNER_TEXT,
		SECURITY_BANNER_COLOR, 
		DEFAULT_APPROVAL_ORGANIZATION,
		MAP_LAYERS
	}
	
	private Handle dbHandle;
	private Map<String,String> cachedSettings;
	
	public AdminDao(Handle db) { 
		this.dbHandle = db;
		
		cachedSettings = new HashMap<String,String>();
		List<AdminSetting> settings = getAllSettings();
		for (AdminSetting s : settings){ 
			cachedSettings.put(s.getKey(), s.getValue());
		}
	}
	
	public String getSetting(AdminSettingKeys key) { 
		return cachedSettings.get(key.toString());
	}
	
	public List<AdminSetting> getAllSettings() { 
		return dbHandle.createQuery("SELECT * FROM adminSettings")
				.map(new AdminSettingMapper())
				.list();
	}
	

	public int saveSetting(AdminSetting setting) {
		cachedSettings.put(setting.getKey(), setting.getValue());
		return dbHandle.createStatement("UPDATE adminSettings SET value = :value WHERE [key] = :key")
			.bind("key", setting.getKey())
			.bind("value", setting.getValue())
			.execute();
	}
	
}
