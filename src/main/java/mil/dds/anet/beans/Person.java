package mil.dds.anet.beans;

import java.security.Principal;
import java.util.Objects;

import org.joda.time.DateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import mil.dds.anet.views.AbstractAnetView;

public class Person extends AbstractAnetView<Person> implements Principal{

	public static enum Status { ACTIVE, INACTIVE }
	public static enum Role { ADVISOR, PRINCIPAL, USER }
	
	private String firstName; 
	private String lastName;
	private Status status;
	private Role role;
	private Boolean pendingVerification;
	
	private String emailAddress;
	private String phoneNumber;
	
	private String rank;
	private String biography;
	
	private DateTime createdAt;
	private DateTime updatedAt;
	
	public Person() { 
		this.pendingVerification = false; //Defaults 
	}
	
	@Override
	@JsonIgnore
	public String getName() {
		return String.format("%s %s (%s)", firstName, lastName, emailAddress);
	}
	
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
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

	@Override
	public boolean equals(Object o) { 
		if (o == null || getClass() != o.getClass()) {
            return false;
        }
		Person other = (Person) o;
		boolean b = Objects.equals(id, other.getId()) && 
			Objects.equals(other.getFirstName(), getFirstName()) &&
			Objects.equals(other.getLastName(), this.getLastName()) &&
			Objects.equals(other.getStatus(), this.getStatus()) && 
			Objects.equals(other.getRole(), role) && 
			Objects.equals(other.getEmailAddress(), this.getEmailAddress()) && 
			Objects.equals(other.getPhoneNumber(), this.getPhoneNumber()) && 
			Objects.equals(other.getRank(), this.getRank()) && 
			Objects.equals(other.getBiography(), this.getBiography()) &&
			Objects.equals(other.getPendingVerification(), pendingVerification) &&
			Objects.equals(other.getCreatedAt(), createdAt) &&
			Objects.equals(other.getUpdatedAt(), updatedAt);
		return b;
 	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, firstName, lastName, status, role, emailAddress,
			phoneNumber, rank, biography, createdAt, updatedAt, pendingVerification);
	}
	
	@Override
	public String toString() { 
		return String.format("%s %s (%s)", firstName, lastName, emailAddress);
	}
	
	public static Person createWithId(int id) { 
		Person p = new Person();
		p.setId(id);
		p.setLoadLevel(LoadLevel.ID_ONLY);
		return p;
	}
	
}
