package mil.dds.anet.beans;

import java.util.Objects;

import org.joda.time.DateTime;

import mil.dds.anet.views.AbstractAnetView;

public class Tashkil extends AbstractAnetView<Tashkil> {

	String code;
	String name;
	
	DateTime createdAt;
	DateTime updatedAt;
	
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

	public DateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(DateTime createdAt) {
		this.createdAt = createdAt;
	}
	public DateTime getUpdatedAt() {
		return updatedAt;
	}
	public void setUpdatedAt(DateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
	
	@Override
	public boolean equals(Object o){ 
		if (o == null || o.getClass() != Tashkil.class) { 
			return false;
		}
		Tashkil other = (Tashkil) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getCode(), code) &&
				Objects.equals(other.getName(), name) &&
				Objects.equals(other.getCreatedAt(), createdAt) &&
				Objects.equals(other.getUpdatedAt(), updatedAt);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, code, name, createdAt, updatedAt);
	}
	
	@Override
	public String toString() { 
		return String.format("[%d] - %s - %s", id, code, name);
	}
	public static Tashkil createWithId(int tashkilId) {
		Tashkil t = new Tashkil();
		t.setId(tashkilId);
		t.setLoadLevel(LoadLevel.ID_ONLY);
		return t;
	}
}
