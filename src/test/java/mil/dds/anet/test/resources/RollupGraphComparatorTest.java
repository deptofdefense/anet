package mil.dds.anet.test.resources;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;

import mil.dds.anet.beans.RollupGraph;
import mil.dds.anet.resources.ReportResource.RollupGraphComparator;
import mil.dds.anet.test.TestData;

public class RollupGraphComparatorTest {

	@Test
	public void performTest() {
		
		List<RollupGraph> rollupGraphs = new ArrayList<>();
		
		RollupGraph rollupGraph1 = TestData.createRollupGraph();
		rollupGraph1.getOrg().setLongName("a name");
		rollupGraphs.add(rollupGraph1);
		
		RollupGraph rollupGraph2 = TestData.createRollupGraph();
		rollupGraph2.getOrg().setLongName("b name");
		rollupGraphs.add(rollupGraph2);
		
		RollupGraph rollupGraph3 = TestData.createRollupGraph();
		rollupGraph3.getOrg().setLongName("c name");
		rollupGraphs.add(rollupGraph3);
		
		RollupGraph rollupGraph4 = TestData.createRollupGraph();
		rollupGraph4.getOrg().setLongName("d name");
		rollupGraphs.add(rollupGraph4);
		
		Collections.sort(rollupGraphs, new RollupGraphComparator(Arrays.asList("c name", "xxx", "yyy", "b name")));
		
		Assert.assertEquals("incorrect name", "c name", rollupGraphs.get(0).getOrg().getLongName());
		Assert.assertEquals("incorrect name", "b name", rollupGraphs.get(1).getOrg().getLongName());
		Assert.assertEquals("incorrect name", "a name", rollupGraphs.get(2).getOrg().getLongName());
		Assert.assertEquals("incorrect name", "d name", rollupGraphs.get(3).getOrg().getLongName());
		
	}
	
	@Test
	public void performTestEmptyList() {
		
		List<RollupGraph> rollupGraphs = new ArrayList<>();
		
		RollupGraph rollupGraph1 = TestData.createRollupGraph();
		rollupGraph1.getOrg().setLongName("a name");
		rollupGraphs.add(rollupGraph1);
		
		RollupGraph rollupGraph2 = TestData.createRollupGraph();
		rollupGraph2.getOrg().setLongName("b name");
		rollupGraphs.add(rollupGraph2);
		
		RollupGraph rollupGraph3 = TestData.createRollupGraph();
		rollupGraph3.getOrg().setLongName("c name");
		rollupGraphs.add(rollupGraph3);
		
		Collections.sort(rollupGraphs, new RollupGraphComparator(new ArrayList<>()));
		
		Assert.assertEquals("incorrect name", "a name", rollupGraphs.get(0).getOrg().getLongName());
		Assert.assertEquals("incorrect name", "b name", rollupGraphs.get(1).getOrg().getLongName());
		Assert.assertEquals("incorrect name", "c name", rollupGraphs.get(2).getOrg().getLongName());
		
	}
}
