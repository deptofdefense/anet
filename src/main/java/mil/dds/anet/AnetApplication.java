package mil.dds.anet;

import java.util.EnumSet;
import java.util.Map;

import javax.servlet.DispatcherType;
import javax.servlet.Filter;
import javax.servlet.FilterRegistration;

import org.eclipse.jetty.server.session.SessionHandler;
import org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature;
import org.joda.time.DateTimeZone;
import org.skife.jdbi.v2.DBI;

import com.google.common.collect.ImmutableList;

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
import mil.dds.anet.auth.AnetAuthenticationFilter;
import mil.dds.anet.auth.AnetDevAuthenticator;
import mil.dds.anet.beans.Person;
import mil.dds.anet.config.AnetConfiguration;
import mil.dds.anet.resources.AdminResource;
import mil.dds.anet.resources.ApprovalStepResource;
import mil.dds.anet.resources.GraphQLResource;
import mil.dds.anet.resources.GroupResource;
import mil.dds.anet.resources.HomeResource;
import mil.dds.anet.resources.LocationResource;
import mil.dds.anet.resources.OrganizationResource;
import mil.dds.anet.resources.PersonResource;
import mil.dds.anet.resources.PoamResource;
import mil.dds.anet.resources.PositionResource;
import mil.dds.anet.resources.ReportResource;
import mil.dds.anet.resources.SavedSearchResource;
import mil.dds.anet.resources.SearchResource;
import mil.dds.anet.resources.TestingResource;
import mil.dds.anet.views.ViewResponseFilter;
import waffle.servlet.NegotiateSecurityFilter;

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
		//Allow the anet.yml configuration to pull from Environment Variables. 
		bootstrap.setConfigurationSourceProvider(
			new SubstitutingSourceProvider(
				bootstrap.getConfigurationSourceProvider(),
				new EnvironmentVariableSubstitutor(false)
			)
		);

		//Add the db migration commands
		bootstrap.addBundle(new MigrationsBundle<AnetConfiguration>() {
	        @Override
	        public DataSourceFactory getDataSourceFactory(AnetConfiguration configuration) {
	        	System.out.println(configuration.getDataSourceFactory().getUrl());
	            return configuration.getDataSourceFactory();
	        }
	    });

		//Serve assets on /assets
		bootstrap.addBundle(new AssetsBundle("/assets", "/assets", "index.html"));
		bootstrap.addBundle(new AssetsBundle("/imagery", "/imagery", null, "imagery"));

		//Use Freemarker to handle rendering TEXT_HTML views. 
		bootstrap.addBundle(new ViewBundle<AnetConfiguration>() {
			@Override
			public Map<String, Map<String, String>> getViewConfiguration(AnetConfiguration configuration) {
				return configuration.getViews();
			}
		});
	}

	@Override
	public void run(AnetConfiguration configuration, Environment environment) {
		System.out.println(configuration.getDataSourceFactory().getUrl());
		DateTimeZone.setDefault(DateTimeZone.UTC);
		final DBIFactory factory = new DBIFactory();
		final DBI jdbi = factory.build(environment, configuration.getDataSourceFactory(), "mssql");

		final AnetObjectEngine engine = new AnetObjectEngine(jdbi);
		environment.servlets().setSessionHandler(new SessionHandler());

		if (configuration.isDevelopmentMode()) {
			//In development mode just allow basic HTTP Authentication
			environment.jersey().register(new AuthDynamicFeature(
					new BasicCredentialAuthFilter.Builder<Person>()
						.setAuthenticator(new AnetDevAuthenticator(engine))
						.setAuthorizer(new AnetAuthenticationFilter(engine)) //Acting only as Authz.
						.setRealm("ANET")
						.buildAuthFilter()));	
		} else { 
			//In Production require Windows AD Authentication.
			Filter nsf = new NegotiateSecurityFilter();
			FilterRegistration nsfReg = environment.servlets().addFilter("NegotiateSecurityFilter", nsf);
			nsfReg.setInitParameters(configuration.getWaffleConfig());
			nsfReg.addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), true, "/*");
			environment.jersey().register(new AuthDynamicFeature(new AnetAuthenticationFilter(engine)));
		}
		
	    //If you want to use @Auth to inject a custom Principal type into your resource
	    environment.jersey().register(new AuthValueFactoryProvider.Binder<>(Person.class));
	    //If you want to use @RolesAllowed to do authorization.
	    environment.jersey().register(RolesAllowedDynamicFeature.class);
	    environment.jersey().register(new WebExceptionMapper());

	    Thread emailThread = new Thread(new AnetEmailWorker(jdbi.open(), configuration));
	    emailThread.start();
	    
		TestingResource test = new TestingResource(engine, configuration);
		PersonResource personResource = new PersonResource(engine);
		GroupResource groupResource = new GroupResource(engine);
		PoamResource poamResource =  new PoamResource(engine);
		LocationResource locationResource = new LocationResource(engine);
		OrganizationResource orgResource = new OrganizationResource(engine);
		PositionResource positionResource = new PositionResource(engine);
		ApprovalStepResource asResource = new ApprovalStepResource(engine);
		ReportResource reportResource = new ReportResource(engine);
		AdminResource adminResource = new AdminResource(engine);
		HomeResource homeResource = new HomeResource(engine);
		SearchResource searchResource = new SearchResource(engine);
		SavedSearchResource savedSearchResource = new SavedSearchResource(engine);

		environment.jersey().register(test);
		environment.jersey().register(personResource);
		environment.jersey().register(groupResource);
		environment.jersey().register(poamResource);
		environment.jersey().register(locationResource);
		environment.jersey().register(orgResource);
		environment.jersey().register(positionResource);
		environment.jersey().register(asResource);
		environment.jersey().register(reportResource);
		environment.jersey().register(adminResource);
		environment.jersey().register(homeResource);
		environment.jersey().register(searchResource);
		environment.jersey().register(savedSearchResource);
		environment.jersey().register(new ViewResponseFilter(configuration));
		environment.jersey().register(new GraphQLResource(
			ImmutableList.of(reportResource, personResource, 
				positionResource, locationResource,
				orgResource, asResource, poamResource, 
				groupResource, adminResource, searchResource, savedSearchResource)));

	}

}
