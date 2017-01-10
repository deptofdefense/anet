package mil.dds.anet.beans;

import java.util.List;

import mil.dds.anet.beans.geo.Location;
import mil.dds.anet.graphql.IGraphQLBean;

public class SearchResults implements IGraphQLBean {

	List<Person> people;
	List<Report> reports;
	List<Position> positions;
	List<Poam> poams; 
	List<Location> locations;
	List<Organization> organizations;
	
	
	public List<Person> getPeople() {
		return people;
	}
	public void setPeople(List<Person> people) {
		this.people = people;
	}
	public List<Report> getReports() {
		return reports;
	}
	public void setReports(List<Report> reports) {
		this.reports = reports;
	}
	public List<Position> getPositions() {
		return positions;
	}
	public void setPositions(List<Position> positions) {
		this.positions = positions;
	}
	public List<Poam> getPoams() {
		return poams;
	}
	public void setPoams(List<Poam> poams) {
		this.poams = poams;
	}
	public List<Location> getLocations() {
		return locations;
	}
	public void setLocations(List<Location> locations) {
		this.locations = locations;
	}
	public List<Organization> getOrganizations() {
		return organizations;
	}
	public void setOrganizations(List<Organization> organizations) {
		this.organizations = organizations;
	}
}
