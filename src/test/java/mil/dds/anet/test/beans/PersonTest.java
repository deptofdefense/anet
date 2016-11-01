package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;

public class PersonTest extends BeanTester<Person> {

	public static Person getJackJacksonStub() { 
		final Person person = new Person();
		person.setFirstName("Jack");
		person.setLastName("Jackson");
		person.setEmailAddress("foobar@example.com");
		person.setPhoneNumber("123-456-78960");
		person.setRank("OF-9");
		person.setStatus(Status.ACTIVE);
		person.setRole(Role.ADVISOR);
		person.setBiography("this is a sample biography");
		return person;
	}

	public static Person getSteveStevesonStub() {
		Person person = new Person();
		person.setFirstName("Steve");
		person.setLastName("Steveson");
		person.setEmailAddress("steve@example.com");
		person.setPhoneNumber("+011-258-32895");
		person.setRank("LtCol");
		person.setStatus(Status.ACTIVE);
		person.setRole(Role.PRINCIPAL);
		person.setBiography("this is a sample person who could be a Principal!");
		return person;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getJackJacksonStub(), "testJson/people/jack.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getJackJacksonStub(), "testJson/people/jack.json");
    }

	public static Person getRogerRogwell() {
		Person person = new Person();
		person.setFirstName("Roger");
		person.setLastName("Rogwell");
		person.setEmailAddress("roger@example.com");
		person.setPhoneNumber("+1-412-543-2839");
		person.setRank("Maj");
		person.setStatus(Status.ACTIVE);
		person.setRole(Role.PRINCIPAL);
		person.setBiography("roger is another test person that we have in the database. ");
		return person;
	}

	
	

}