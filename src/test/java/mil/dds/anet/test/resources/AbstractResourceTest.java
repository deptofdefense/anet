package mil.dds.anet.test.resources;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.Invocation.Builder;

import org.junit.ClassRule;

import io.dropwizard.testing.junit.DropwizardAppRule;
import mil.dds.anet.AnetApplication;
import mil.dds.anet.config.AnetConfiguration;

public abstract class AbstractResourceTest {

	@ClassRule
    public static final DropwizardAppRule<AnetConfiguration> RULE =
            new DropwizardAppRule<AnetConfiguration>(AnetApplication.class, "anet.yml");
	
	public static Client client;
	
	public Builder httpQuery(String path) { 
		if (path.startsWith("/") == false ) { path = "/" + path; } 
		return client.target(String.format("http://localhost:%d%s", RULE.getLocalPort(), path))
			.request();
		
	}
}
