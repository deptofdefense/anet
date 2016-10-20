package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Tashkil;

public class TashkilTest extends BeanTester<Tashkil> {
	
	public static Tashkil getTestTashkil() { 
		Tashkil t = new Tashkil();
		t.setCode("ABCDEF-12345-1");
		t.setName("Chief of Donuts");
		return t;
	}

	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestTashkil(), "testJson/tashkils/testTashkil.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestTashkil(), "testJson/tashkils/testTashkil.json");
    }
	
}
