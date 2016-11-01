package mil.dds.anet.views.person;

import java.util.List;

import mil.dds.anet.beans.Person;
import mil.dds.anet.views.AbstractAnetView;

public class PersonListView extends AbstractAnetView<PersonListView> {

	List<Person> people;
	
	public PersonListView(List<Person> people) {
		this.people = people;
		render("/views/person/index.ftl");
	}
	
	public List<Person> getPeople() { 
		return people;
	}
	 
}
