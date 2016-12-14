package mil.dds.anet.auth;

import java.util.List;
import java.util.Optional;

import io.dropwizard.auth.AuthenticationException;
import io.dropwizard.auth.Authenticator;
import io.dropwizard.auth.basic.BasicCredentials;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.database.PersonDao;

public class AnetDevAuthenticator implements Authenticator<BasicCredentials, Person> {
	
	PersonDao dao;
	
	public AnetDevAuthenticator(AnetObjectEngine engine) { 
		this.dao = engine.getPersonDao();
	}

	@Override
	public Optional<Person> authenticate(BasicCredentials credentials) throws AuthenticationException {
		List<Person> p = dao.findByProperty("domainUsername", credentials.getUsername());
        if (p.size() > 0) { 
            return Optional.of(p.get(0));
        }
        return Optional.empty();
	}
	
}