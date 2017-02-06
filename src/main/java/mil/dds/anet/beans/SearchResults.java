package mil.dds.anet.beans;

import mil.dds.anet.beans.lists.AbstractAnetBeanList.LocationList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.OrganizationList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PersonList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PoamList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.PositionList;
import mil.dds.anet.beans.lists.AbstractAnetBeanList.ReportList;
import mil.dds.anet.graphql.IGraphQLBean;

public class SearchResults implements IGraphQLBean {

	PersonList people;
	ReportList reports;
	PositionList positions;
	PoamList poams; 
	LocationList locations;
	OrganizationList organizations;
	
	public PersonList getPeople() {
		return people;
	}
	public void setPeople(PersonList people) {
		this.people = people;
	}
	public ReportList getReports() {
		return reports;
	}
	public void setReports(ReportList reports) {
		this.reports = reports;
	}
	public PositionList getPositions() {
		return positions;
	}
	public void setPositions(PositionList positions) {
		this.positions = positions;
	}
	public PoamList getPoams() {
		return poams;
	}
	public void setPoams(PoamList poams) {
		this.poams = poams;
	}
	public LocationList getLocations() {
		return locations;
	}
	public void setLocations(LocationList locations) {
		this.locations = locations;
	}
	public OrganizationList getOrganizations() {
		return organizations;
	}
	public void setOrganizations(OrganizationList organizations) {
		this.organizations = organizations;
	}
}
