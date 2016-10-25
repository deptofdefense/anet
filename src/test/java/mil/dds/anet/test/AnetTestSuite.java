package mil.dds.anet.test;


import org.junit.runner.RunWith;
import org.junit.runners.Suite;

import mil.dds.anet.test.beans.AdvisorOrganizationTest;
import mil.dds.anet.test.beans.ApprovalStepTest;
import mil.dds.anet.test.beans.BilletTest;
import mil.dds.anet.test.beans.GroupTest;
import mil.dds.anet.test.beans.PersonTest;
import mil.dds.anet.test.beans.PoamTest;
import mil.dds.anet.test.beans.ReportTest;
import mil.dds.anet.test.beans.TashkilTest;
import mil.dds.anet.test.resources.AdvisorOrganizationResourceTest;
import mil.dds.anet.test.resources.ApprovalStepResourceTest;
import mil.dds.anet.test.resources.BilletResourceTest;
import mil.dds.anet.test.resources.GroupsResourceTest;
import mil.dds.anet.test.resources.LocationResourceTest;
import mil.dds.anet.test.resources.PersonResourceTest;
import mil.dds.anet.test.resources.PoamResourceTest;
import mil.dds.anet.test.resources.ReportsResourceTest;
import mil.dds.anet.test.resources.TashkilResourceTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
  GroupTest.class,
  PersonTest.class,
  PoamTest.class,
  TashkilTest.class,
  ReportTest.class,
  AdvisorOrganizationTest.class,
  BilletTest.class,
  ApprovalStepTest.class,
  GroupsResourceTest.class,
  PersonResourceTest.class,
  PoamResourceTest.class,
  LocationResourceTest.class,
  TashkilResourceTest.class,
  AdvisorOrganizationResourceTest.class,
  BilletResourceTest.class,
  ApprovalStepResourceTest.class,
  ReportsResourceTest.class
})

public class AnetTestSuite {

}
