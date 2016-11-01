package mil.dds.anet.views.person;

import io.dropwizard.views.View;
import mil.dds.anet.beans.Person;

public class PersonForm extends View {

	Person person;
	
	public PersonForm(Person p ) { 
		super("form.ftl");
		this.person = p;
	}
	
	public Person getPerson() { 
		return person;
	}
	
//	@Override
//	public String getTemplateName() { 
//		return "fuck you";
//	}
}
