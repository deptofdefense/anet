package mil.dds.anet.beans;

import java.util.Objects;

import org.apache.commons.lang3.StringUtils;

public class Person {

	public static enum Status { ACTIVE, INACTIVE }
	
	private int id;
	
	private String firstName; 
	private String lastName;
	private Status status;
	
	private String emailAddress;
	private String phoneNumber;
	
	private String rank;
	private String biography;
	
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
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

	@Override
	public boolean equals(Object o) { 
		if (o == null || getClass() != o.getClass()) {
            return false;
        }
		Person other = (Person) o;
		return this.getId() == other.getId() && 
			Objects.equals(other.getFirstName(), getFirstName()) &&
			Objects.equals(other.getLastName(), this.getLastName()) &&
			Objects.equals(other.getStatus(), this.getStatus()) && 
			Objects.equals(other.getEmailAddress(), this.getEmailAddress()) && 
			Objects.equals(other.getPhoneNumber(), this.getPhoneNumber()) && 
			Objects.equals(other.getRank(), this.getRank()) && 
			Objects.equals(other.getBiography(), this.getBiography()); 
	}
	
	@Override
	public int hashCode() { 
		return Objects.hash(id, firstName, lastName, status, emailAddress,
			phoneNumber, rank, biography);
	}
	
}
