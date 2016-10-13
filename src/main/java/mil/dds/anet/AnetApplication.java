package mil.dds.anet;

import org.skife.jdbi.v2.DBI;

import io.dropwizard.Application;
import io.dropwizard.configuration.EnvironmentVariableSubstitutor;
import io.dropwizard.configuration.SubstitutingSourceProvider;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.database.TestingDao;
import mil.dds.anet.resources.TestingResource;

public class AnetApplication extends Application<AnetConfiguration> {
	public static void main(String[] args) throws Exception {
		new AnetApplication().run(args);
	}

	@Override
	public String getName() {
		return "anet";
	}

	@Override
	public void initialize(Bootstrap<AnetConfiguration> bootstrap) {
		bootstrap.setConfigurationSourceProvider(
				new SubstitutingSourceProvider(
						bootstrap.getConfigurationSourceProvider(),
						new EnvironmentVariableSubstitutor(false)));
	}

	@Override
	public void run(AnetConfiguration configuration, Environment environment) {
		System.out.println(configuration.getDataSourceFactory().getUrl());
		final DBIFactory factory = new DBIFactory();
		final DBI jdbi = factory.build(environment, configuration.getDataSourceFactory(), "mssql");
		final TestingDao dao = jdbi.onDemand(TestingDao.class);
		
		
		TestingResource test = new TestingResource(dao); 
		environment.jersey().register(test);
	}

}
