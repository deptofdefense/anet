package mil.dds.anet;

import org.skife.jdbi.v2.DBI;

import io.dropwizard.Application;
import io.dropwizard.assets.AssetsBundle;
import io.dropwizard.auth.AuthDynamicFeature;
import io.dropwizard.auth.AuthValueFactoryProvider;
import io.dropwizard.auth.basic.BasicCredentialAuthFilter;
import io.dropwizard.configuration.EnvironmentVariableSubstitutor;
import io.dropwizard.configuration.SubstitutingSourceProvider;
import io.dropwizard.db.DataSourceFactory;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.migrations.MigrationsBundle;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.dropwizard.views.ViewBundle;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.resources.AdvisorOrganizationResource;
import mil.dds.anet.resources.ApprovalStepResource;
import mil.dds.anet.resources.BilletResource;
import mil.dds.anet.resources.GroupResource;
import mil.dds.anet.resources.LocationResource;
import mil.dds.anet.resources.PersonResource;
import mil.dds.anet.resources.PoamResource;
import mil.dds.anet.resources.ReportResource;
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

		bootstrap.addBundle(new AssetsBundle("/assets", "/assets", "index.html"));
		bootstrap.addBundle(new ViewBundle<AnetConfiguration>());
	}

	@Override
	public void run(AnetConfiguration configuration, Environment environment) {
		System.out.println(configuration.getDataSourceFactory().getUrl());
		final DBIFactory factory = new DBIFactory();
		final DBI jdbi = factory.build(environment, configuration.getDataSourceFactory(), "mssql");

		final AnetObjectEngine engine = new AnetObjectEngine(jdbi);

		environment.jersey().register(new AuthDynamicFeature(
	            new BasicCredentialAuthFilter.Builder<Person>()
	                .setAuthenticator(new AnetAuthenticator(engine))
//	                .setAuthorizer(new ExampleAuthorizer())
	                .setRealm("ANET")
	                .buildAuthFilter()));
//	    environment.jersey().register(RolesAllowedDynamicFeature.class);
	    //If you want to use @Auth to inject a custom Principal type into your resource
	    environment.jersey().register(new AuthValueFactoryProvider.Binder<>(Person.class));
	    environment.jersey().register(new WebExceptionMapper());
	    
		TestingResource test = new TestingResource(engine);
		PersonResource personResource = new PersonResource(engine);
		GroupResource groupResource = new GroupResource(engine);
		TashkilResource tashkilResource = new TashkilResource(engine);
		PoamResource poamResource =  new PoamResource(engine);
		LocationResource locationResource = new LocationResource(engine);
		AdvisorOrganizationResource aoResource = new AdvisorOrganizationResource(engine);
		BilletResource billetResource = new BilletResource(engine);
		ApprovalStepResource asResource = new ApprovalStepResource(engine);
		ReportResource reportResource = new ReportResource(engine);

		environment.jersey().register(test);
		environment.jersey().register(personResource);
		environment.jersey().register(groupResource);
		environment.jersey().register(tashkilResource);
		environment.jersey().register(poamResource);
		environment.jersey().register(locationResource);
		environment.jersey().register(aoResource);
		environment.jersey().register(billetResource);
		environment.jersey().register(asResource);
		environment.jersey().register(reportResource);

	}

}
