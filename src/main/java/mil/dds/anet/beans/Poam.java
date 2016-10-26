package mil.dds.anet.beans;

import java.util.Objects;

public class Poam {

	Integer id;
	String shortName;
	String longName;
	String category;
	Integer parentPoamId;
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getShortName() {
		return shortName;
	}
	public void setShortName(String shortName) {
		this.shortName = shortName;
	}
	public String getLongName() {
		return longName;
	}
	public void setLongName(String longName) {
		this.longName = longName;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public Integer getParentPoamId() {
		return parentPoamId;
	}
	public void setParentPoamId(Integer parentPoamId) {
		this.parentPoamId = parentPoamId;
	}
	
	public static Poam create(String shortName, String longName, String category) { 
		return create(shortName, longName, category, null);
	}
	
	public static Poam create(String shortName, String longName, String category, Poam parent) { 
		Poam p = new Poam();
		p.setShortName(shortName);
		p.setLongName(longName);
		p.setCategory(category);
		if (parent != null) { p.setParentPoamId(parent.getId()); }
		return p;
	}
	
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != this.getClass()) { 
			return false;
		}
		Poam other = (Poam) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getShortName(), shortName) &&
				Objects.equals(other.getLongName(), longName) &&
				Objects.equals(other.getCategory(), category) &&
				Objects.equals(other.getParentPoamId(), parentPoamId);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, shortName, longName, category, parentPoamId);
	}
	
}
