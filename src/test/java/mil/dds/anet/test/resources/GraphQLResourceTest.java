package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;

import org.apache.commons.io.IOUtils;
import org.assertj.core.api.Assertions;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Person;

public class GraphQLResourceTest extends AbstractResourceTest {

	private Logger logger = LoggerFactory.getLogger(GraphQLResourceTest.class);

	public GraphQLResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("graphql test client");
		}
	}
	
	@Test
	public void test() {
		Person arthur = getArthurDmin();
		Person jack = getJackJackson();
		Person steve = getSteveSteveson();
		File testDir = new File("src/test/resources/graphQLTests/");
		testDir.getAbsolutePath();
		assertThat(testDir.isDirectory()).isTrue();
		
		Map<String,Object> variables = new HashMap<String,Object>();
		variables.put("personId", jack.getId().toString());
		variables.put("positionId", jack.loadPosition().getId());
		variables.put("orgId", steve.loadPosition().loadOrganization().getId());
		variables.put("searchQuery", "hospital");
		variables.put("reportId", jack.loadAttendedReports(0, 20).getList().get(0).getId());
		variables.put("pageNum", 0);
		variables.put("pageSize", 10);
		variables.put("maxResults", 6);
		logger.info("Using variables {}", variables);
		
		for (File f : testDir.listFiles()) { 
			if (f.isFile()) { 
				try { 
					String raw = IOUtils.toString(new FileInputStream(f));
					Map<String,Object> query = new HashMap<String,Object>();
					for (Map.Entry<String, Object> entry : variables.entrySet()) { 
						raw = raw.replace("${" + entry.getKey() + "}", entry.getValue().toString());
					}
					query.put("query", "query { " + raw + "}");
					query.put("variables", ImmutableMap.of());
					logger.info("Processing file {}", f);

					// Test POST request
					Map<String,Object> respPost = httpQuery("/graphql", arthur)
							.post(Entity.json(query), new GenericType<Map<String,Object>>() {});
					doAsserts(f, respPost);

					// Test GET request
					Map<String,Object> respGet = httpQuery("/graphql?query=" + URLEncoder.encode("{" + raw + "}", "UTF-8"), arthur)
							.get(new GenericType<Map<String,Object>>() {});
					doAsserts(f, respGet);

					// POST and GET responses should be equal
					assertThat(respPost.get("data")).isEqualTo(respGet.get("data"));
				} catch (IOException e) { 
					Assertions.fail("Unable to read file ", e);
				}
			}
		}
	}

	private void doAsserts(File f, Map<String, Object> resp) {
		assertThat(resp).isNotNull();
		assertThat(resp.containsKey("errors"))
			.as("Has Errors on %s : %s, %s",f.getName(),resp.get("errors"), resp.values().toString())
			.isFalse();
		assertThat(resp.containsKey("data")).as("Missing Data on " + f.getName(), resp).isTrue();
	}
	
}
