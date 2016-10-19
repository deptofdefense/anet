package mil.dds.anet.test;


import org.junit.runner.RunWith;
import org.junit.runners.Suite;

import mil.dds.anet.test.beans.GroupTest;
import mil.dds.anet.test.beans.PersonTest;
import mil.dds.anet.test.resources.GroupsResourceTest;
import mil.dds.anet.test.resources.PersonResourceTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
  GroupTest.class,
  PersonTest.class,
  GroupsResourceTest.class,
  PersonResourceTest.class
})

public class AnetTestSuite {

}
