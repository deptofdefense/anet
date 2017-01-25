package mil.dds.anet.test.resources;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;

import org.apache.commons.io.IOUtils;
import org.assertj.core.api.Assertions;
import org.junit.Test;

import com.google.common.collect.ImmutableMap;

import io.dropwizard.client.JerseyClientBuilder;
import mil.dds.anet.beans.Person;



public class GraphQLResourceTest extends AbstractResourceTest{

	public GraphQLResourceTest() { 
		if (client == null) { 
			client = new JerseyClientBuilder(RULE.getEnvironment()).using(config).build("graphql test client");
		}
	}
	
	@Test
	public void test() {
		Person arthur = getArthurDmin();
		Person jack = getJackJackson();
		File testDir = new File("src/test/resources/graphQLTests/");
		testDir.getAbsolutePath();
		assertThat(testDir.isDirectory()).isTrue();
		
		Map<String,Object> variables = new HashMap<String,Object>();
		variables.put("personId", jack.getId().toString());
		variables.put("positionId", jack.loadPosition().getId());
		variables.put("orgId", jack.loadPosition().loadOrganization().getId());
		variables.put("searchQuery", "hospital");
		variables.put("reportId", jack.loadAttendedReports(0, 20).get(0).getId());
		
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
					
					Map<String,Object> resp = httpQuery("/graphql", arthur).post(Entity.json(query), new GenericType<Map<String,Object>>() {});
					assertThat(resp).isNotNull();
					assertThat(resp.containsKey("errors")).as("Has Errors on " + f.getName() + ": " + resp.get("errors"), resp.values()).isFalse();
					assertThat(resp.containsKey("data")).as("Missing Data on " + f.getName(), resp).isTrue();
					
				} catch (IOException e) { 
					Assertions.fail("Unable to read file ", e);
				}
			}
		}
	}
	
}
