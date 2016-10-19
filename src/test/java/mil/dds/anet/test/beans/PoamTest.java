package mil.dds.anet.test.beans;

import static io.dropwizard.testing.FixtureHelpers.fixture;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.dropwizard.jackson.Jackson;
import mil.dds.anet.beans.Poam;

public class PoamTest {

	private static final ObjectMapper MAPPER = Jackson.newObjectMapper();

	public static Poam getTestPoam() { 
		Poam p = new Poam();
		p.setShortName("F-1");
		p.setLongName("Run the bases");
		p.setCategory("Functional Area");
		return p;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		Poam p = getTestPoam();
		final String expected = MAPPER.writeValueAsString(MAPPER.readValue(fixture("testJson/poam/testPoam.json"), Poam.class));

		assertThat(MAPPER.writeValueAsString(p)).isEqualTo(expected);
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		Poam p = getTestPoam();
        assertThat(MAPPER.readValue(fixture("testJson/poam/testPoam.json"), Poam.class)).isEqualTo(p);
    }
	
}
