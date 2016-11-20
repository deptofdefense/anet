package mil.dds.anet;

import java.util.List;
import java.util.Optional;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.PersonDao;

public class AnetAuthenticator implements Authenticator<BasicCredentials, Person> {
	
	PersonDao dao;
	
	public AnetAuthenticator(AnetObjectEngine engine) { 
		this.dao = engine.getPersonDao();
	}

	@Override
	public Optional<Person> authenticate(BasicCredentials credentials) throws AuthenticationException {
		List<Person> p = dao.findByProperty("name", credentials.getUsername() + " " +  credentials.getPassword());
        if (p.size() > 0) { 
            return Optional.of(p.get(0));
        }
        return Optional.empty();
	}
	
}