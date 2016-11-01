package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;

public class PersonTest extends BeanTester<Person> {

	public static Person getJackJackson() { 
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

	public static Person getSteveSteveson() {
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
		serializesToJSON(getJackJackson(), "testJson/people/jack.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getJackJackson(), "testJson/people/jack.json");
    }

	
	

}