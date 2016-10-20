package mil.dds.anet.test.beans;

import java.util.List;

import org.junit.Test;

import com.google.common.collect.Lists;

import mil.dds.anet.beans.Group;
import mil.dds.anet.beans.Person;

public class GroupTest extends BeanTester<Group> {

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
		serializesToJSON(getGroupAlpha(), "testJson/groups/groupA.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getGroupAlpha(), "testJson/groups/groupA.json");
    }
}
