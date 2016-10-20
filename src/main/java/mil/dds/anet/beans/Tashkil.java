package mil.dds.anet.beans;

import java.util.Objects;

public class Tashkil {

	Integer id;
	String code;
	String name;
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}

	@Override
	public boolean equals(Object o){ 
		if (o == null || o.getClass() != Tashkil.class) { 
			return false;
		}
		Tashkil other = (Tashkil) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getCode(), code) &&
				Objects.equals(other.getName(), name);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, code, name);
	}
}
