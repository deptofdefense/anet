package mil.dds.anet.beans;

import java.util.List;

import org.joda.time.DateTime;

import mil.dds.anet.beans.geo.Location;

public class Report {

	public static enum Vibe { POSITIVE, NEGATIVE }
	
	int id;
	
	DateTime dtg;
	Location location;
	String intent;
	
	List<Person> principals;
//	List<PoamTask> tasks;
	
	Vibe atmosphere;
	String atmosphereDetails;
	String reportText;
	String nextSteps;
	
	Person author;	
	
	List<Comment> comments;
	
}
