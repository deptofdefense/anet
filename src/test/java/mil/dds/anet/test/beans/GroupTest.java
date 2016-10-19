package mil.dds.anet.test.beans;

import static io.dropwizard.testing.FixtureHelpers.fixture;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;

import io.dropwizard.jackson.Jackson;
import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;

public class GroupTest {

	private static final ObjectMapper MAPPER = Jackson.newObjectMapper();

	public static Group getGroupAlpha() { 
		Group alpha = new Group();
		alpha.setName("Group Alpha");
		
		Person a = new Person();
		a.setId(1);
		Person b = new Person();
		b.setId(2);
		List<Person> members = Lists.newArrayList(a,b);
		alpha.setMembers(members);
		
		return alpha;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		Group g = getGroupAlpha();
		final String expected = MAPPER.writeValueAsString(MAPPER.readValue(fixture("testJson/groups/groupA.json"), Group.class));

		assertThat(MAPPER.writeValueAsString(g)).isEqualTo(expected);
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		Group a = getGroupAlpha();
        assertThat(MAPPER.readValue(fixture("testJson/groups/groupA.json"), Group.class)).isEqualTo(a);
    }
}
