package mil.dds.anet.test.beans;

import org.junit.Test;

import mil.dds.anet.beans.Position;
import mil.dds.anet.beans.Position.PositionType;

public class PositionTest extends BeanTester<Position> {

	public static Position getTestPosition() {
		Position b = new Position();
		b.setName("Head of donut operations");
		b.setCode("DNT-001");
		b.setType(PositionType.PRINCIPAL);
		return b;
	}
	
	@Test
	public void serializesToJson() throws Exception {
		serializesToJson(getTestPosition(), "testJson/positions/testPosition.json");
	}
	
	@Test
	public void deserializesFromJson() throws Exception {
		deserializesFromJson(getTestPosition(), "testJson/positions/testPosition.json");
    }
	
}
