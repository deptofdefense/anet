package mil.dds.anet.test.beans;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

import mil.dds.anet.beans.Poam;
import mil.dds.anet.views.AbstractAnetBean.LoadLevel;

public class PoamTest extends BeanTester<Poam> {

	public static Poam getTestPoam() { 
		Poam p = new Poam();
		p.setShortName("F-1");
		p.setLongName("Run the bases");
		p.setCategory("Functional Area");
		return p;
	}
	
	@Test
	public void serializesToJson() throws Exception {
		serializesToJson(getTestPoam(), "testJson/poam/testPoam.json");
	}
	
	@Test
	public void deserializesFromJson() throws Exception {
		deserializesFromJson(getTestPoam(), "testJson/poam/testPoam.json");
    }

	@Test
	public void staticCreatorTest() { 
		Poam p = Poam.createWithId(4);
		assertThat(p.getId()).isEqualTo(4);
		assertThat(p.getLoadLevel()).isEqualTo(LoadLevel.ID_ONLY);
		assertThat(p.getLongName()).isNull();
	}
}
