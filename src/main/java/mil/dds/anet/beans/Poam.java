package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.utils.DaoUtils;
import mil.dds.anet.views.AbstractAnetBean;

public class Poam extends AbstractAnetBean {

	String shortName;
	String longName;
	String category;
	Poam parentPoam;
	List<Poam> childrenPoams;
	
	Organization responsibleOrg;

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
	
	@JsonSetter("parentPoam")
	public void setParentPoam(Poam parent) {
		this.parentPoam = parent;
	}
	
	@JsonGetter("parentPoam")
	public Poam getParentPoamJson() { 
		return this.parentPoam;
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
	
	@JsonSetter("childrenPoams")
	public void setChildrenPoams(List<Poam> childrenPoams) { 
		this.childrenPoams = childrenPoams;
	}
	
	@JsonSetter("responsibleOrg")
	public void setResponsibleOrg(Organization org) { 
		this.responsibleOrg = org;
	}
	
	@JsonIgnore
	public Organization getResponsibleOrg() {
		if (responsibleOrg == null || responsibleOrg.getLoadLevel() == null) { return responsibleOrg; } 
		if (responsibleOrg.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.responsibleOrg = AnetObjectEngine.getInstance()
					.getOrganizationDao().getById(responsibleOrg.getId());
		}
		return responsibleOrg;
	}
	
	@JsonGetter("responsibleOrg")
	public Organization getResponsibleOrgJson() { 
		return responsibleOrg;
	}
	
	public static Poam create(String shortName, String longName, String category) { 
		return create(shortName, longName, category, null, null);
	}
	
	public static Poam create(String shortName, String longName, String category, Poam parent, Organization responsibleOrg) { 
		Poam p = new Poam();
		p.setShortName(shortName);
		p.setLongName(longName);
		p.setCategory(category);
		p.setParentPoam(parent);
		p.setResponsibleOrg(responsibleOrg);
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
				idEqual(other.getParentPoamJson(), parentPoam);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, shortName, longName, category, parentPoam);
	}
	
	@Override
	public String toString() { 
		return String.format("%d - %s - %s - %s - %d", id, shortName, longName, category, DaoUtils.getId(parentPoam));
	}
	
}
