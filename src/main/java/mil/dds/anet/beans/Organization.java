package mil.dds.anet.beans;

import java.util.List;
import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.views.AbstractAnetBean;

public class Organization extends AbstractAnetBean {

	public static enum OrganizationType { ADVISOR_ORG, PRINCIPAL_ORG }
	
	String name;
	Organization parentOrg;
	OrganizationType type;
	
	List<Position> positions; /*Positions in this AO, lazy loaded*/
	List<ApprovalStep> approvalSteps; /*Approval process for this AO, lazy loaded */
	List<Organization> childrenOrgs; /* Lazy loaded */
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}

	@JsonIgnore
	public Organization getParentOrg() { 
		if (parentOrg == null || parentOrg.getLoadLevel() == null) { return parentOrg; }
		if (parentOrg.getLoadLevel().contains(LoadLevel.PROPERTIES) == false) { 
			this.parentOrg = AnetObjectEngine.getInstance()
					.getOrganizationDao().getById(parentOrg.getId());
		}
		return parentOrg;
	}
	
	@GraphQLIgnore
	@JsonGetter("parentOrg")
	public Organization getParentOrgJson() {
		return parentOrg;
	}
	
	@JsonSetter("parentOrg")
	public void setParentOrg(Organization parentOrg) {
		this.parentOrg = parentOrg;
	}
	
	public OrganizationType getType() {
		return type;
	}
	public void setType(OrganizationType type) {
		this.type = type;
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
	public List<Position> getPositions() {
		if (positions == null) {
			positions = AnetObjectEngine.getInstance()
					.getPositionDao().getByOrganization(this);
		}
		return positions;
	}
	
	@JsonIgnore
	public List<ApprovalStep> getApprovalSteps() { 
		if (approvalSteps == null) { 
			approvalSteps = AnetObjectEngine.getInstance()
					.getApprovalStepsForOrg(this);
		}
		return approvalSteps;
	}
	
	@JsonIgnore
	public List<Organization> getChildrenOrgs() { 
		if (childrenOrgs == null) { 
			childrenOrgs = AnetObjectEngine.getInstance().getOrganizationDao().getByParentOrgId(id);
		}
		return childrenOrgs;
	}
	
	@GraphQLIgnore
	@JsonGetter("childrenOrgss")
	public List<Organization> getChildrenOrgsJson() { 
		return childrenOrgs;
	}
	
	@JsonSetter("childrenOrgs")
	public void setChildrenOrgss(List<Organization> childrenOrgs) { 
		this.childrenOrgs = childrenOrgs;
	}
	
	public static Organization create(String name, OrganizationType type) { 
		Organization org = new Organization();
		org.setName(name);
		org.setType(type);
		return org;
	}
	
	public static Organization createWithId(Integer id) { 
		Organization ao = new Organization();
		ao.setId(id);
		ao.setLoadLevel(LoadLevel.ID_ONLY);
		return ao;
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || o.getClass() != this.getClass()) { 
			return false;
		}
		Organization other = (Organization) o;
		return Objects.equals(other.getId(), id) &&
				Objects.equals(other.getName(), name) &&
				Objects.equals(other.getType(), type);
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, type, createdAt, updatedAt);
	}
}
