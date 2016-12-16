package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Role;
import mil.dds.anet.beans.Person.Status;
import mil.dds.anet.beans.ReportPerson;

public class PersonTest extends BeanTester<Person> {

	public static Person getJackJacksonStub() { 
		final Person person = new Person();
		person.setName("Jack Jackson");
		person.setEmailAddress("hunter+foobar@dds.mil");
		person.setPhoneNumber("123-456-78960");
		person.setRank("OF-9");
		person.setStatus(Status.ACTIVE);
		person.setRole(Role.ADVISOR);
		person.setBiography("this is a sample biography");
		person.setDomainUsername("jack");
		return person;
	}

	public static Person getSteveStevesonStub() {
		Person person = new Person();
		person.setName("Steve Steveson");
		person.setEmailAddress("hunter+steve@dds.mil");
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
		person.setName("Roger Rogwell");
		person.setEmailAddress("hunter+roger@dds.mil");
		person.setPhoneNumber("+1-412-543-2839");
		person.setRank("Maj");
		person.setStatus(Status.ACTIVE);
		person.setRole(Role.PRINCIPAL);
		person.setBiography("roger is another test person that we have in the database. ");
		return person;
	}

	public static Person getElizabethElizawell() {
		Person person = new Person();
		person.setName("Elizabeth Elizawell");
		person.setEmailAddress("hunter+liz@dds.mil");
		person.setPhoneNumber("+1-777-7777");
		person.setRank("Capt");
		person.setStatus(Status.ACTIVE);
		person.setRole(Role.ADVISOR);
		person.setBiography("elizabeth is another test person we have in the database");
		person.setDomainUsername("elizabeth");
		return person;
	}

	public static Person getNickNicholson() { 
		Person p = new Person();
		p.setName("Nick Nicholson");
		p.setEmailAddress("hunter+nick@dds.mil");
		p.setPhoneNumber("+1-202-7324");
		p.setRank("CIV");
		p.setStatus(Status.ACTIVE);
		p.setRole(Role.ADVISOR);
		p.setBiography("");
		p.setDomainUsername("nick");
		return p;
	}
	
	public static Person getBobBobtown() { 
		Person p = new Person();
		p.setName("Bob Bobtown");
		p.setEmailAddress("hunter+bob@dds.mil");
		p.setPhoneNumber("+1-444-7324");
		p.setRank("CIV");
		p.setStatus(Status.ACTIVE);
		p.setRole(Role.ADVISOR);
		p.setBiography("Bob is the EF1 Super User");
		p.setDomainUsername("bob");
		return p;
	}
	
	public static ReportPerson personToReportPerson(Person p) {
		ReportPerson rp = new ReportPerson();
		rp.setName(p.getName());
		rp.setId(p.getId());
		rp.setPhoneNumber(p.getPhoneNumber());
		rp.setEmailAddress(p.getEmailAddress());
		rp.setBiography(p.getBiography());
		rp.setLoadLevel(p.getLoadLevel());
		rp.setCreatedAt(p.getCreatedAt());
		rp.setUpdatedAt(p.getUpdatedAt());
		rp.setRank(p.getRank());
		rp.setRole(p.getRole());
		rp.setPendingVerification(p.getPendingVerification());
		rp.setStatus(p.getStatus());
		return rp;
	}

	public static Person getArthurDmin() {
		Person p = new Person();
		p.setName("Arthur Dmin");
		p.setEmailAddress("hunter+arthur@dds.mil");
		p.setStatus(Status.ACTIVE);
		p.setRole(Role.ADVISOR);
		p.setDomainUsername("arthur");
		return p;
	}

	
	

}