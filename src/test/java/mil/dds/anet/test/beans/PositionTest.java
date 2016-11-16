package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Position;

public class PositionTest extends BeanTester<Position> {

	public static Position getTestPosition() {
		Position b = new Position();
		b.setName("Head of donut operations");
		b.setCode("DNT-001");
		return b;
	}
	
	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestPosition(), "testJson/positions/testPosition.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestPosition(), "testJson/positions/testPosition.json");
    }
	
}
