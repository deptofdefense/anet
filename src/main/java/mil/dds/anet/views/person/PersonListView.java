package mil.dds.anet.views.person;

import java.util.List;

import io.dropwizard.views.View;
import mil.dds.anet.beans.Person;

public class PersonListView extends View {

	List<Person> people;
	
	public PersonListView(List<Person> people) {
		super("index.mustache");
		this.people = people;
	}
	
	public List<Person> getPeople() { 
		return people;
	}
	 
}
