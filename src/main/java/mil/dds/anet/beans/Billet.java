package mil.dds.anet.beans;

import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.views.AbstractAnetView;

public class Billet extends AbstractAnetView<Billet> {

	Integer id;
	String name;
	DateTime createdAt;
	DateTime updatedAt;
	AdvisorOrganization advisorOrganization;

	public static Billet createWithId(Integer id) { 
		Billet b = new Billet();
		b.setId(id);
		return b;
	}
	
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
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

	@JsonIgnore
	public AdvisorOrganization getAdvisorOrganization() {
		if (advisorOrganization == null) { return null; } 
		if (advisorOrganization.getLoadLevel() == null ) { 
			return advisorOrganization; // just a bean, not a db object! 
		}
		if (advisorOrganization.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.advisorOrganization = getBeanAtLoadLevel(advisorOrganization, LoadLevel.PROPERTIES);
		}
		return advisorOrganization;
	}
	
	@JsonSetter("advisorOrganization")
	public void setAdvisorOrganization(AdvisorOrganization ao) {
		this.advisorOrganization = ao;
	}
	
	@JsonGetter("advisorOrganization")
	public AdvisorOrganization getAdvisorOrganizationJson() { 
		return advisorOrganization;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != Billet.class) { 
			return false; 
		}
		Billet other = (Billet) o;
		return Objects.equals(id, other.getId()) &&
			Objects.equals(name, other.getName()) &&
			Objects.equals(advisorOrganization, other.getAdvisorOrganization());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, advisorOrganization);
	}
	
}
