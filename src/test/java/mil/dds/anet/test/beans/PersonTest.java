package mil.dds.anet.test.beans;

import static io.dropwizard.testing.FixtureHelpers.fixture;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.dropwizard.jackson.Jackson;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Person.Status;

public class PersonTest {

	private static final ObjectMapper MAPPER = Jackson.newObjectMapper();

	public static Person getJackJackson() { 
		final Person person = new Person();
		person.setFirstName("Jack");
		person.setLastName("Jackson");
		person.setEmailAddress("foobar@example.com");
		person.setPhoneNumber("123-456-78960");
		person.setRank("OF-9");
		person.setStatus(Status.ACTIVE);
		person.setBiography("this is a sample biography");
		return person;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		Person person = getJackJackson();
		final String expected = MAPPER.writeValueAsString(MAPPER.readValue(fixture("testJson/people/jack.json"), Person.class));

		assertThat(MAPPER.writeValueAsString(person)).isEqualTo(expected);
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		Person person = getJackJackson();
        assertThat(MAPPER.readValue(fixture("testJson/people/jack.json"), Person.class)).isEqualTo(person);
    }
}