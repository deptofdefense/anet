package mil.dds.anet.test.beans;

import static org.assertj.core.api.Assertions.assertThat;
import java.util.LinkedList;

import org.joda.time.DateTime;
import org.joda.time.chrono.ISOChronology;
import org.junit.Test;

import mil.dds.anet.beans.Comment;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.Poam;
import mil.dds.anet.beans.Report;
import mil.dds.anet.beans.Report.ReportState;
import mil.dds.anet.beans.geo.LatLng;
import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.views.AbstractAnetView.LoadLevel;

public class ReportTest extends BeanTester<Report> {

	public static Report getTestReport() { 
		Report r = new Report();
		r.setCreatedAt(new DateTime(1453753380000L, ISOChronology.getInstanceUTC()));
		r.setUpdatedAt(new DateTime(1453753380000L, ISOChronology.getInstanceUTC()));
		r.setState(ReportState.DRAFT);
		
		Location loc = Location.create("The Boat Dock", new LatLng(32.456,-123.4999));
		r.setLocation(loc);
		r.setIntent("Check up with Steve");
		
		r.setAuthor(PersonTest.getJackJacksonStub());
		
		LinkedList<Poam> poams = new LinkedList<Poam>();
		poams.add(PoamTest.getTestPoam());
		poams.add(PoamTest.getTestPoam());
		r.setPoams(poams);
		
		LinkedList<Person> principals = new LinkedList<Person>();
		principals.add(PersonTest.getSteveStevesonStub());
		r.setPrincipals(principals);
		
		r.setReportText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");
		r.setNextSteps("Go for a boat ride with Steve tomorrow");
		
		LinkedList<Comment> comments = new LinkedList<Comment>();
		Comment c = new Comment();
		c.setCreatedAt(new DateTime(1453815803000L, ISOChronology.getInstanceUTC()));
		c.setAuthor(PersonTest.getJackJacksonStub());
		c.setText("I really like this report, it's awesome!!!");
		c.setReportId(null);
		comments.add(c);
		r.setComments(comments);
		
		return r;
	}
	
	
	
	@Test
	public void serializesToJSON() throws Exception {
		serializesToJSON(getTestReport(), "testJson/reports/test.json");
	}
	
	@Test
    public void deserializesFromJSON() throws Exception {
		deserializesFromJSON(getTestReport(), "testJson/reports/test.json");
    }
	
	@Test
	public void staticCreatorTest() { 
		Report r = Report.createWithId(4);
		assertThat(r.getId()).isEqualTo(4);
		assertThat(r.getLoadLevel()).isEqualTo(LoadLevel.ID_ONLY);
		assertThat(r.getReportText()).isNull();
		assertThat(r.getApprovalStepJson()).isNull();
		assertThat(r.getNextSteps()).isNull();
		assertThat(r.getCreatedAt()).isNull();
	}
	
}
