package mil.dds.anet;

import org.skife.jdbi.v2.DBI;

import io.dropwizard.Application;
import io.dropwizard.configuration.EnvironmentVariableSubstitutor;
import io.dropwizard.configuration.SubstitutingSourceProvider;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.migrations.MigrationsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.database.AdvisorOrganizationDao;
import mil.dds.anet.database.GroupDao;
import mil.dds.anet.database.LocationDao;
import mil.dds.anet.database.PersonDao;
import mil.dds.anet.database.PoamDao;
import mil.dds.anet.database.TashkilDao;
import mil.dds.anet.database.TestingDao;
import mil.dds.anet.resources.AdvisorOrganizationResource;
import mil.dds.anet.resources.GroupResource;
import mil.dds.anet.resources.LocationResource;
import mil.dds.anet.resources.PersonResource;
import mil.dds.anet.resources.PoamResource;
import mil.dds.anet.resources.TashkilResource;
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
		
		bootstrap.addBundle(new MigrationsBundle<AnetConfiguration>() {
	        @Override
	        public DataSourceFactory getDataSourceFactory(AnetConfiguration configuration) {
	        	System.out.println(configuration.getDataSourceFactory().getUrl());
	            return configuration.getDataSourceFactory();
	        }
	    });
	}

	@Override
	public void run(AnetConfiguration configuration, Environment environment) {
		System.out.println(configuration.getDataSourceFactory().getUrl());
		final DBIFactory factory = new DBIFactory();
		final DBI jdbi = factory.build(environment, configuration.getDataSourceFactory(), "mssql");
		
		final TestingDao dao = jdbi.onDemand(TestingDao.class);
		final PersonDao personDao = jdbi.onDemand(PersonDao.class);
		final GroupDao groupDao = new GroupDao(jdbi.open());
		final TashkilDao tashkilDao = jdbi.onDemand(TashkilDao.class);
		final PoamDao poamDao = jdbi.onDemand(PoamDao.class);
		final LocationDao locationDao =  jdbi.onDemand(LocationDao.class);
		final AdvisorOrganizationDao aoDao = new AdvisorOrganizationDao(jdbi.open(), groupDao);
		
		TestingResource test = new TestingResource(dao); 
		PersonResource personResource = new PersonResource(personDao);
		GroupResource groupResource = new GroupResource(groupDao);
		TashkilResource tashkilResource = new TashkilResource(tashkilDao);
		PoamResource poamResource =  new PoamResource(poamDao);
		LocationResource locationResource = new LocationResource(locationDao);
		AdvisorOrganizationResource aoResource = new AdvisorOrganizationResource(aoDao);
		
		environment.jersey().register(test);
		environment.jersey().register(personResource);
		environment.jersey().register(groupResource);
		environment.jersey().register(tashkilResource);
		environment.jersey().register(poamResource);
		environment.jersey().register(locationResource);
		environment.jersey().register(aoResource);
		
	}

}
