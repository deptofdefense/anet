package mil.dds.anet.beans;

import java.util.Objects;

import mil.dds.anet.views.AbstractAnetView;

public class AdvisorOrganization extends AbstractAnetView<AdvisorOrganization> {

	String name;
	Integer memberGroupId;
		
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Integer getMemberGroupId() {
		return memberGroupId;
	}
	public void setMemberGroupId(Integer memberGroupId) {
		this.memberGroupId = memberGroupId;
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
				Objects.equals(other.getName(), name) &&
				Objects.equals(other.getMemberGroupId(), memberGroupId);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, memberGroupId);
	}
}
