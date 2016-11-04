package mil.dds.anet.test;

import org.junit.Test;

import mil.dds.anet.beans.Person;
import mil.dds.anet.utils.DaoUtils;

import static org.assertj.core.api.Assertions.assertThat;

//TODO: Probably rename this. 
public class RandomTests {

	@Test
	public void randomTests() { 
		Person p = new Person();
		assertThat(DaoUtils.getId(p)).isNull();
		p.setId(4);
		assertThat(DaoUtils.getId(p)).isEqualTo(4);
		
	}
	
}
