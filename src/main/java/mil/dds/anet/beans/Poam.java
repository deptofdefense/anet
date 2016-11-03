package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.views.AbstractAnetView;

public class Poam extends AbstractAnetView<Poam> {

	String shortName;
	String longName;
	String category;
	Poam parentPoam;
	List<Poam> childrenPoams;

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
	
	@JsonIgnore
	public Poam getParentPoam() {
		if (parentPoam == null) { return null; }
		if (parentPoam.getLoadLevel() == null) { return parentPoam; } 
		if (parentPoam.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.parentPoam = AnetObjectEngine.getInstance()
					.getPoamDao().getById(parentPoam.getId());
		}
		return parentPoam;
	}
	
	@JsonGetter("parentPoam")
	public void setParentPoam(Poam parent) {
		this.parentPoam = parent;
	}
	
	@JsonIgnore
	public List<Poam> getChildrenPoams(){ 
		if (childrenPoams == null) { 
			childrenPoams = AnetObjectEngine.getInstance()
					.getPoamDao().getPoamsByParentId(this.getId());
		}
		return childrenPoams;
	}
	
	@JsonGetter("childrenPoams")
	public List<Poam> getChildrenPoamsJson() { 
		return childrenPoams;
	}
	public void setChildrenPoams(List<Poam> childrenPoams) { 
		this.childrenPoams = childrenPoams;
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
		p.setParentPoam(parent);
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
				Objects.equals(other.getParentPoam(), parentPoam);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, shortName, longName, category, parentPoam);
	}
	
}
