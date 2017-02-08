package mil.dds.anet.test;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

import mil.dds.anet.beans.Person;
import mil.dds.anet.utils.DaoUtils;

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
