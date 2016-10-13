package mil.dds.anet.beans;

import java.util.List;

import org.joda.time.DateTime;

import mil.dds.anet.beans.geo.Location;

public class Report {

	public static enum Vibe {POSITIVE, NEGATIVE }
	
	DateTime dtg;
	Location location;
	String intent;
	
	List<Principal> principals;
//	List<PoamTask> tasks;
	
	Vibe atmosphere;
	String atmosphereDetails;
	String reportText;
	String nextSteps;
	
	
	Advisor author;
	
	
}
