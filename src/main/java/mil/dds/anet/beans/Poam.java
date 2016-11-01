package mil.dds.anet.beans;

import java.util.Objects;

import org.joda.time.DateTime;

import mil.dds.anet.views.AbstractAnetView;

public class Poam extends AbstractAnetView<Poam> {

	String shortName;
	String longName;
	String category;
	Integer parentPoamId;

	DateTime createdAt;
	DateTime updatedAt;

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
	
	public static Poam createWithId(Integer id) { 
		Poam p = new Poam();
		p.setId(id);
		p.setLoadLevel(LoadLevel.ID_ONLY);
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
