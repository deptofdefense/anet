package mil.dds.anet.beans;

import java.util.Objects;

public class Billet {

	Integer id;
	String name;
	Integer advisorOrganizationId;

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
	public Integer getAdvisorOrganizationId() {
		return advisorOrganizationId;
	}
	public void setAdvisorOrganizationId(Integer advisingOrganizationId) {
		this.advisorOrganizationId = advisingOrganizationId;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != Billet.class) { 
			return false; 
		}
		Billet other = (Billet) o;
		return Objects.equals(id, other.getId()) &&
			Objects.equals(name, other.getName()) &&
			Objects.equals(advisorOrganizationId, other.getAdvisorOrganizationId());
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, advisorOrganizationId);
	}
	
}
