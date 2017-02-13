import React from 'react'
import Page from 'components/Page'
import {Alert, Table, Modal, Button, Nav, NavItem, Badge} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import {ContentForNav} from 'components/Nav'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import LinkTo from 'components/LinkTo'
import ReportCollection from 'components/ReportCollection'
import Form from 'components/Form'
import Messages from 'components/Messages'

import API from 'api'
import {Person, Organization, Position, Poam} from 'models'

import EVERYTHING_ICON from 'resources/search-alt.png'
import REPORTS_ICON from 'resources/reports.png'
import PEOPLE_ICON from 'resources/people.png'
import LOCATIONS_ICON from 'resources/locations.png'
import POAMS_ICON from 'resources/poams.png'
import POSITIONS_ICON from 'resources/positions.png'
import ORGANIZATIONS_ICON from 'resources/organizations.png'

const QUERY_STRINGS = {
	reports: {
		pendingApprovalOf: "reports pending your approval",
		authorOrgId: "reports recently authored by your organization",
		authorId: "reports you recently authored",
	},
	organizations: "Organizations TODO",
	people: "People TODO",
}

const SEARCH_CONFIG = {
	"reports" : {
		listName : "reports: reportList",
		variableType: "ReportSearchQuery",
		fields : `id, intent, engagementDate, keyOutcomes, nextSteps, cancelledReason,
			author { id, name }
			primaryAdvisor { id, name, role, position { organization { id, shortName}}},
			primaryPrincipal { id, name, role, position { organization { id, shortName}}},
			advisorOrg { id, shortName},
			principalOrg { id, shortName},
			location { id, name, lat, lng},
			poams {id, shortName, longName}`
	},
	"persons" : {
		listName : "people: peopleList",
		variableType: "PersonSearchQuery",
		fields: "id, name, rank, emailAddress, role , position { id, name, organization { id, shortName} }"
	},
	"positions" : {
		listName: "positions: positionList",
		variableType: "PositionSearchQuery",
		fields: "id , name, type, organization { id, shortName}, person { id, name }"
	},
	"poams" : {
		listName: "poams: poamList",
		variableType: "PoamSearchQuery",
		fields: "id, shortName, longName"
	},
	"locations" : {
		listName: "locations: locationList",
		variableType: "LocationSearchQuery",
		fields : "id, name, lat, lng"
	},
	"organizations" : {
		listName: "organizations: organizationList",
		variableType: "OrganizationSearchQuery",
		fields: "id, shortName, longName"
	}
};

export default class Search extends Page {
	constructor(props) {
		super(props)

		this.state = {
			query: props.location.query.text,
			saveSearch: {show: false},
			reportsPageNum: 0,
			results: {
				reports: null,
				people: null,
				organizations: null,
				positions: null,
				location: null,
				poams: null
			},
			error: null,
			success: null
		}
	}


	fetchData(props) {
		let type = props.location.query.type
		let text = props.location.query.text

		//Any query with a field other than 'text' and 'type' is an advanced query.
		let advQuery = Object.without(props.location.query, "type", "text")
		let isAdvQuery = Object.keys(advQuery).length
		advQuery.text = text

		if (isAdvQuery) {
			// FIXME currently you have to pass page params in the query object
			// instead of the query variables
			advQuery.pageSize = 10
			advQuery.pageNum = this.state.reportsPageNum

			let config = SEARCH_CONFIG[type]
			API.query(/* GraphQL */`
					${config.listName} (f:search, query:$query) {
						pageNum, pageSize, totalCount, list { ${config.fields} }
					}
				`,
				{query: advQuery}, `($query: ${config.variableType})`
			).then(data => {
				this.setState({results: data})
			}).catch(response =>
				this.setState({error: response})
			)
		} else {
			//TODO: escape query in the graphQL query
			API.query(/* GraphQL */`
				searchResults(f:search, q:"${text}", pageNum:0, pageSize: 10) {
					reports { pageNum, pageSize, totalCount, list { ${SEARCH_CONFIG.reports.fields}} }
					people { pageNum, pageSize, totalCount, list { ${SEARCH_CONFIG.persons.fields}} }
					positions { pageNum, pageSize, totalCount, list { ${SEARCH_CONFIG.positions.fields} }}
					poams { pageNum, pageSize, totalCount, list { ${SEARCH_CONFIG.poams.fields} }}
					locations { pageNum, pageSize, totalCount, list { ${SEARCH_CONFIG.locations.fields} }}
					organizations { pageNum, pageSize, totalCount, list { ${SEARCH_CONFIG.organizations.fields} }}
				}
			`).then(data =>
				this.setState({results: data.searchResults})
			).catch(response => {
				this.setState({error: response})
			})
		}
	}

	render() {
		let results = this.state.results
		let error = this.state.error
		let success = this.state.success

		let numReports = results.reports ? results.reports.totalCount : 0
		let numPeople = results.people ? results.people.totalCount : 0
		let numPositions = results.positions ? results.positions.totalCount : 0
		let numPoams = results.poams ? results.poams.totalCount : 0
		let numLocations = results.locations ? results.locations.totalCount : 0
		let numOrganizations = results.organizations ? results.organizations.totalCount : 0

		let numResults = numReports + numPeople + numPositions + numLocations + numOrganizations
		let noResults = numResults === 0

		let query = this.props.location.query
		let queryString = QUERY_STRINGS[query.type] || query.text || "TODO"
		let queryType = this.state.queryType || query.type || 'everything'

		if (typeof queryString === 'object') {
			queryString = queryString[Object.keys(query)[1]]
		}

		return (
			<div>
				<Breadcrumbs items={[['Searching for ' + queryString, '/search']]} />

				<ContentForNav>
					<div>
						<div><Button onClick={History.goBack} bsStyle="link">&lt; Return to previous page</Button></div>

						<Nav stacked bsStyle="pills" activeKey={queryType} onSelect={this.onSelectQueryType}>
							<NavItem eventKey="everything" disabled={!numResults}>
								<img src={EVERYTHING_ICON} role="presentation" /> Everything
								{numResults > 0 && <Badge pullRight>{numResults}</Badge>}
							</NavItem>

							<NavItem eventKey="reports" disabled={!numReports}>
								<img src={REPORTS_ICON} role="presentation" /> Reports
								{numReports > 0 && <Badge pullRight>{numReports}</Badge>}
							</NavItem>

							<NavItem eventKey="people" disabled={!numPeople}>
								<img src={PEOPLE_ICON} role="presentation" /> People
								{numPeople > 0 && <Badge pullRight>{numPeople}</Badge>}
							</NavItem>

							<NavItem eventKey="positions" disabled={!numPositions}>
								<img src={POSITIONS_ICON} role="presentation" /> Positions
								{numPositions > 0 && <Badge pullRight>{numPositions}</Badge>}
							</NavItem>

							<NavItem eventKey="poams" disabled={!numPoams}>
								<img src={POAMS_ICON} role="presentation" /> PoAMs
								{numPoams > 0 && <Badge pullRight>{numPoams}</Badge>}
							</NavItem>

							<NavItem eventKey="locations" disabled={!numLocations}>
								<img src={LOCATIONS_ICON} role="presentation" /> Locations
								{numLocations > 0 && <Badge pullRight>{numLocations}</Badge>}
							</NavItem>

							<NavItem eventKey="organizations" disabled={!numOrganizations}>
								<img src={ORGANIZATIONS_ICON} role="presentation" /> Organizations
								{numOrganizations > 0 && <Badge pullRight>{numOrganizations}</Badge>}
							</NavItem>
						</Nav>
					</div>
				</ContentForNav>

				<Messages error={error} success={success} />

				{noResults &&
					<Alert bsStyle="warning">
						<b>No search results found!</b>
					</Alert>
				}

				<div className="pull-right">
					{this.props.location.query.text && <Button onClick={this.showSaveModal}>Save search</Button>}
				</div>

				{numReports > 0 && (queryType === 'everything' || queryType === 'reports') &&
					<fieldset>
						<legend>Reports</legend>
						<ReportCollection paginatedReports={results.reports} goToPage={this.goToReportsPage} />
					</fieldset>
				}

				{numPeople > 0 && (queryType === 'everything' || queryType === 'people') &&
					<fieldset>
						<legend>People</legend>
						{this.renderPeople()}
					</fieldset>
				}

				{numOrganizations > 0 && (queryType === 'everything' || queryType === 'organizations') &&
					<fieldset>
						<legend>Organizations</legend>
						{this.renderOrgs()}
					</fieldset>
				}

				{numPositions > 0 && (queryType === 'everything' || queryType === 'positions') &&
					<fieldset>
						<legend>Positions</legend>
						{this.renderPositions()}
					</fieldset>
				}

				{numLocations > 0 && (queryType === 'everything' || queryType === 'locations') &&
					<fieldset>
						<legend>Locations</legend>
						{this.renderLocations()}
					</fieldset>
				}

				{numPoams > 0 && (queryType === 'everything' || queryType === 'poams') &&
					<fieldset>
						<legend>PoAMs</legend>
						{this.renderPoams()}
					</fieldset>
				}

				{this.renderSaveModal()}
			</div>
		)
	}

	renderPeople() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Name</th>
					<th>Position</th>
					<th>Org</th>
				</tr>
			</thead>
			<tbody>
				{Person.map(this.state.results.people.list, person =>
					<tr key={person.id}>
						<td>
							<img src={person.iconUrl()} alt={person.role} height={20} className="person-icon" />
							<LinkTo person={person}>{person.rank} {person.name}</LinkTo>
						</td>
						<td>{person.phoneNumber}</td>
						<td>{person.position && <LinkTo position={person.position} />}</td>
						<td>{person.position && person.position.organization && <LinkTo organization={person.position.organization} />}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}

	renderOrgs() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
					<th>Type</th>
				</tr>
			</thead>
			<tbody>
				{Organization.map(this.state.results.organizations.list, org =>
					<tr key={org.id}>
						<td><LinkTo organization={org} /></td>
						<td>{org.longName}</td>
						<td>{org.type}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}

	renderPositions() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Name</th>
					<th>Org</th>
					<th>Current Occupant</th>
				</tr>
			</thead>
			<tbody>
				{Position.map(this.state.results.positions.list, pos =>
					<tr key={pos.id}>
						<td>
							<img src={pos.iconUrl()} alt={pos.type} height={20} className="person-icon" />
							<LinkTo position={pos} >{pos.code} {pos.name}</LinkTo>
						</td>
						<td>{pos.organization && <LinkTo organization={pos.organization} />}</td>
						<td>{pos.person && <LinkTo person={pos.person} />}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}

	renderLocations() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Name</th>
				</tr>
			</thead>
			<tbody>
				{this.state.results.locations.list.map(loc =>
					<tr key={loc.id}>
						<td><LinkTo location={loc} /></td>
					</tr>
				)}
			</tbody>
		</Table>

	}

	renderPoams() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Name</th>
				</tr>
			</thead>
			<tbody>
				{Poam.map(this.state.results.poams.list, poam =>
					<tr key={poam.id}>
						<td><LinkTo poam={poam} >{poam.shortName} {poam.longName}</LinkTo></td>
					</tr>
				)}
			</tbody>
		</Table>

	}

	renderSaveModal() {
		return <Modal show={this.state.saveSearch.show} onHide={this.closeSaveModal}>
			<Modal.Header closeButton>
				<Modal.Title>Save search</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Form formFor={this.state.saveSearch} onChange={this.onChangeSaveSearch}
					onSubmit={this.onSubmitSaveSearch} submitText={false}>
					<Form.Field id="name" placeholder="Give this saved search a name" />
					<Button type="submit" bsStyle="primary">Save</Button>
				</Form>
			</Modal.Body>
		</Modal>
	}


	@autobind
	onChangeSaveSearch() {
		let search = this.state.saveSearch;
		this.setState({saveSearch: search})
	}

	@autobind
	onSubmitSaveSearch(event) {
		event.stopPropagation()
		event.preventDefault()

		let search = Object.without(this.state.saveSearch, "show")
		search.query = this.props.location.query.text

		API.send('/api/savedSearches/new', search, {disableSubmits: true})
			.then(response => {
				if (response.code) throw response.code
				this.setState({
					success: "Search successfully saved!",
					saveSearch: {show: false}
				})
				window.scrollTo(0, 0)
			}).catch(response => {
				this.setState({
					error: response,
					saveSearch: {show: false}
				})
				window.scrollTo(0, 0)
			})
	}

	@autobind
	showSaveModal() {
		this.setState({saveSearch: {show: true, name: ''}})
	}

	@autobind
	closeSaveModal() {
		this.setState({saveSearch: {show: false}})
	}

	@autobind
	onSelectQueryType(type) {
		this.setState({queryType: type})
	}

	@autobind
	goToReportsPage(reportsPageNum) {
		this.setState({reportsPageNum}, () => {this.fetchData(this.props)})
	}
}
