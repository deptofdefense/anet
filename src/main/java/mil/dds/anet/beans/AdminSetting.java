package mil.dds.anet.beans;

import com.fasterxml.jackson.annotation.JsonIgnore;

import mil.dds.anet.views.AbstractAnetBean;

public class AdminSetting extends AbstractAnetBean {

	private String key;
	private String value;
	
	
	@Override
	@JsonIgnore
	public Integer getId() { 
		throw new UnsupportedOperationException();
	}
	
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	public String getValue() {
		return value;
	}
	
	public void setValue(String value) {
		this.value = value;
	}
	
	
	
}
