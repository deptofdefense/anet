package mil.dds.anet.beans.search;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.tuple.Pair;
import org.skife.jdbi.v2.Handle;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jersey.repackaged.com.google.common.base.Joiner;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;
import mil.dds.anet.utils.DaoUtils;

public class PersonSearch {

	String text;
	Integer orgId;
	Role role;
	Status status;
	Boolean includeChildOrgs;
	String country;
	Integer locationId;
	Boolean pendingVerification;
	
	@JsonIgnore
	public Pair<String,Map<String,Object>> getQuery(Handle dbHandle) { 
		StringBuilder sql = new StringBuilder("SELECT people.id FROM people ");
		Map<String,Object> sqlArgs = new HashMap<String,Object>();
		
		if (orgId != null || locationId != null) { 
			sql.append(" LEFT JOIN positions ON people.id = positions.currentPersonId ");
		}
		
		sql.append(" WHERE ");
		List<String> whereClauses = new LinkedList<String>();
		
		if (text != null && text.trim().length() > 0) { 
			if (DaoUtils.isMsSql(dbHandle)) { 
				text = "\"" + text + "*\"";
				whereClauses.add("CONTAINS (name, :text)");
			} else { 
				whereClauses.add("(name LIKE '%' || :text || '%' OR emailAddress LIKE '%' || :text || '%' OR biography LIKE '%' || :text || '%')");
			}
			sqlArgs.put("text", text);
		}
		
		if (role != null) { 
			whereClauses.add(" people.role = :role ");
			sqlArgs.put("role", DaoUtils.getEnumId(role));
		}
		
		if (status != null) { 
			whereClauses.add(" people.status = :status ");
			sqlArgs.put("status", DaoUtils.getEnumId(status));
		}
		
		if (country != null && country.trim().length() > 0) { 
			whereClauses.add(" people.country LIKE '%' || :country || '%' ");
			sqlArgs.put("country", country);
		}
		
		if (pendingVerification != null) { 
			whereClauses.add(" people.pendingVerification = :pendingVerification ");
			sqlArgs.put("pendingVerification", pendingVerification);
		}
		
		if (orgId != null) { 
			if (includeChildOrgs != null && includeChildOrgs) { 
				whereClauses.add(" positions.organizationId IN ( "
						+ "WITH RECURSIVE parent_orgs(id) AS ( "
							+ "SELECT id FROM organizations WHERE id = :orgId "
						+ "UNION ALL "
							+ "SELECT o.id from parent_orgs po, organizations o WHERE o.parentOrgId = po.id "
						+ ") SELECT id from parent_orgs)");
			} else { 
				sql.append(" positions.organizationId = :orgId " );
			}
			sqlArgs.put("orgId", orgId);
		}
		
		if (locationId != null) { 
			whereClauses.add(" positions.locationId = :locationId ");
			sqlArgs.put("locationId", locationId);
		}
		
		sql.append(Joiner.on(" AND ").join(whereClauses));
		
		return Pair.of(sql.toString(), sqlArgs);
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public Integer getOrgId() {
		return orgId;
	}

	public void setOrgId(Integer orgId) {
		this.orgId = orgId;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Boolean getIncludeChildOrgs() {
		return includeChildOrgs;
	}

	public void setIncludeChildOrgs(Boolean includeChildOrgs) {
		this.includeChildOrgs = includeChildOrgs;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public Integer getLocationId() {
		return locationId;
	}

	public void setLocationId(Integer locationId) {
		this.locationId = locationId;
	}

	public Boolean getPendingVerification() {
		return pendingVerification;
	}

	public void setPendingVerification(Boolean pendingVerification) {
		this.pendingVerification = pendingVerification;
	}
	
}
