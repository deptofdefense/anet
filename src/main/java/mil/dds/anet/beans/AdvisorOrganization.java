package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import mil.dds.anet.views.AbstractAnetView;

public class AdvisorOrganization extends AbstractAnetView<AdvisorOrganization> {

	String name;
	
	DateTime createdAt;
	DateTime updatedAt;
	
	List<Billet> billets; /*Billets in this AO, lazy loaded*/
	
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
	public List<Billet> getBillets() {
		if (billets == null && engine != null) {
			billets = engine.getBilletDao().getByAdvisorOrganization(this);
		}
		return billets;
	}
	
	public static AdvisorOrganization create(String name) { 
		AdvisorOrganization ao = new AdvisorOrganization();
		ao.setName(name);
		return ao;
	}
	
	public static AdvisorOrganization createWithId(Integer id) { 
		AdvisorOrganization ao = new AdvisorOrganization();
		ao.setId(id);
		ao.setLoadLevel(LoadLevel.ID_ONLY);
		return ao;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != this.getClass()) { 
			return false;
		}
		AdvisorOrganization other = (AdvisorOrganization) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getName(), name);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, createdAt, updatedAt);
	}
}
