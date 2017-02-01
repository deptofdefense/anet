package mil.dds.anet.test;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

import mil.dds.anet.test.beans.ApprovalStepTest;
import mil.dds.anet.test.beans.OrganizationTest;
import mil.dds.anet.test.beans.PersonTest;
import mil.dds.anet.test.beans.PoamTest;
import mil.dds.anet.test.beans.PositionTest;
import mil.dds.anet.test.beans.ReportTest;
import mil.dds.anet.test.resources.ApprovalStepResourceTest;
import mil.dds.anet.test.resources.GraphQLResourceTest;
import mil.dds.anet.test.resources.LocationResourceTest;
import mil.dds.anet.test.resources.OrganizationResourceTest;
import mil.dds.anet.test.resources.PersonResourceTest;
import mil.dds.anet.test.resources.PoamResourceTest;
import mil.dds.anet.test.resources.PositionResourceTest;
import mil.dds.anet.test.resources.ReportsResourceTest;
import mil.dds.anet.test.resources.SavedSearchResourceTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
  PersonTest.class,
  PoamTest.class,
  ReportTest.class,
  OrganizationTest.class,
  PositionTest.class,
  ApprovalStepTest.class,
  ReportTest.class,
  PersonResourceTest.class,
  PoamResourceTest.class,
  LocationResourceTest.class,
  OrganizationResourceTest.class,
  PositionResourceTest.class,
  ApprovalStepResourceTest.class,
  ReportsResourceTest.class,
  RandomTests.class,
  GraphQLResourceTest.class,
  SavedSearchResourceTest.class
})

public class AnetTestSuite {

}
