package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Billet;

public class BilletTest extends BeanTester<Billet> {

	public static Billet getTestBillet() {
		Billet b = new Billet();
		b.setName("Head of donut operations");
		return b;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestBillet(), "testJson/billets/testBillet.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestBillet(), "testJson/billets/testBillet.json");
    }
	
}
