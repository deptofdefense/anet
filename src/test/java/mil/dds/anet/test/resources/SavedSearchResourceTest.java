package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;

import org.junit.Test;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.SearchResults;
import mil.dds.anet.beans.search.SavedSearch;
import mil.dds.anet.beans.search.SavedSearch.SearchObjectType;

public class SavedSearchResourceTest extends AbstractResourceTest {

	public SavedSearchResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("test client");
		}
	}
	
	@Test
	public void testSavedSearches() { 
		Person jack = getJackJackson();
		
		//Create a new saved search and save it.
		SavedSearch ss = new SavedSearch();
		ss.setName("Test Saved Search created by SavedSearchResourceTest");
		ss.setObjectType(SearchObjectType.REPORTS);
		ss.setQuery("q=spreadsheets");
		
		SavedSearch created = httpQuery("/api/savedSearches/new", jack).post(Entity.json(ss), SavedSearch.class);
		assertThat(created.getId()).isNotNull();
		assertThat(created.getQuery()).isEqualTo(ss.getQuery());
		
		//Fetch a list of all of my saved searches
		List<SavedSearch> mine = httpQuery("/api/savedSearches/mine", jack).get(new GenericType<List<SavedSearch>>() {});
		assertThat(mine).contains(created);
		
		//Run a saved search and get results. 
		SearchResults results = httpQuery("/api/search?types=" + created.getObjectType() + "&" + created.getQuery(), jack).get(SearchResults.class);
		assertThat(results.getReports()).isNotEmpty();
	}
}
