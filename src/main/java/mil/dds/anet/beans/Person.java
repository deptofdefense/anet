package mil.dds.anet.beans;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;

import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.graphql.GraphQLIgnore;
import mil.dds.anet.graphql.GraphQLParam;
import mil.dds.anet.views.AbstractAnetBean;

public class Person extends AbstractAnetBean implements Principal{

	public static enum Status { ACTIVE, INACTIVE }
	public static enum Role { ADVISOR, PRINCIPAL }
	
	private String name;
	private Status status;
	private Role role;
	private Boolean pendingVerification;
	
	private String emailAddress;
	private String phoneNumber;
	private String gender;
	private String country;
	private DateTime endOfTourDate;
	
	private String rank;
	private String biography;
	private String domainUsername;
		
	private Optional<Position> position;
	
	public Person() { 
		this.pendingVerification = false; //Defaults 
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Status getStatus() {
		return status;
	}
	public void setStatus(Status status) {
		this.status = status;
	}
	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public Boolean getPendingVerification() {
		return pendingVerification;
	}

	public void setPendingVerification(Boolean pendingVerification) {
		this.pendingVerification = pendingVerification;
	}

	public String getEmailAddress() {
		return emailAddress;
	}
	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}
	public String getPhoneNumber() {
		return phoneNumber;
	}
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public DateTime getEndOfTourDate() {
		return endOfTourDate;
	}

	public void setEndOfTourDate(DateTime endOfTourDate) {
		this.endOfTourDate = endOfTourDate;
	}

	public String getRank() {
		return rank;
	}
	public void setRank(String rank) {
		this.rank = rank;
	}
	public String getBiography() {
		return biography;
	}
	public void setBiography(String biography) {
		this.biography = biography;
	}

	public String getDomainUsername() {
		return domainUsername;
	}

	public void setDomainUsername(String domainUsername) {
		this.domainUsername = domainUsername;
	}

	@JsonIgnore
	public Position getPosition() { 
		if (position == null) {
			position = Optional.ofNullable(AnetObjectEngine.getInstance()
					.getPositionDao().getCurrentPositionForPerson(this));
		}
		return position.orElse(null);
	}
	
	@GraphQLIgnore
	@JsonGetter("position")
	public Position getPositionJson() {
		return (position == null) ? null : position.orElse(null);
	}
	
	@JsonSetter("position")
	public void setPosition(Position p) { 
		if (p != null) { 
			this.position = Optional.of(p);
		}
	}
	
	@JsonIgnore
	public List<Report> getAuthoredReports(@GraphQLParam("pageNum") Integer pageNum, @GraphQLParam("pageSize") Integer pageSize) { 
		return AnetObjectEngine.getInstance().getReportDao().getReportsByAuthor(this, pageNum, pageSize);
	}
	
	@JsonIgnore
	public List<Report> getAttendedReports(@GraphQLParam("pageNum") Integer pageNum, @GraphQLParam("pageSize") Integer pageSize) { 
		return AnetObjectEngine.getInstance().getReportDao().getReportsByAttendee(this, pageNum, pageSize);
	}
	
	@Override
	public boolean equals(Object o) { 
		if (o == null || getClass() != o.getClass()) {
            return false;
        }
		Person other = (Person) o;
		boolean b = Objects.equals(id, other.getId()) &&
			Objects.equals(other.getName(), name) &&
			Objects.equals(other.getStatus(), status) && 
			Objects.equals(other.getRole(), role) && 
			Objects.equals(other.getEmailAddress(), emailAddress) && 
			Objects.equals(other.getPhoneNumber(), phoneNumber) && 
			Objects.equals(other.getRank(), rank) && 
			Objects.equals(other.getBiography(), biography) &&
			Objects.equals(other.getPendingVerification(), pendingVerification) &&
			Objects.equals(other.getCreatedAt(), createdAt) &&
			Objects.equals(other.getUpdatedAt(), updatedAt);
		return b;
 	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, name, status, role, emailAddress,
			phoneNumber, rank, biography, createdAt, updatedAt, pendingVerification);
	}
	
	@Override
	public String toString() { 
		return String.format("%s (%s)", name, emailAddress);
	}
	
	public static Person createWithId(Integer id) {
		if (id == null) { return null; } 
		Person p = new Person();
		p.setId(id);
		p.setLoadLevel(LoadLevel.ID_ONLY);
		return p;
	}
	
}
