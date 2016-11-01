package mil.dds.anet.views.person;

import io.dropwizard.views.View;
import mil.dds.anet.beans.Person;

public class PersonView extends View {

    private final Person person;

    public PersonView(Person person) {
        super("show.ftl");
        this.person = person;
    }

    public Person getPerson() {
        return person;
    }
}
