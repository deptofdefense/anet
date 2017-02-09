import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import {Alert, Radio, Table, DropdownButton, MenuItem, Modal, Button} from 'react-bootstrap'
import {Link} from 'react-router'

import RadioGroup from 'components/RadioGroup'
import Breadcrumbs from 'components/Breadcrumbs'
import LinkTo from 'components/LinkTo'
import ReportCollection from 'components/ReportCollection'
import Form from 'components/Form'
import Messages from 'components/Messages'

import API from 'api'
import {Person, Organization, Position, Poam} from 'models'

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
			query: props.location.query.q,
			saveSearch: {show: false},
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
		let isAdvQuery = Object.keys(advQuery).length;
		advQuery.text = text;

		if (isAdvQuery) {
			let config = SEARCH_CONFIG[type];
			API.query(/* GraphQL */
					`${config.listName} (f:search, query:$query) {
							pageNum, pageSize, totalCount, list { ${config.fields} }
					}`,
					{ query: advQuery},
					`($query: ${config.variableType} )`
				).then( data => {
				this.setState({results: data})
			}).catch(response =>
				this.setState({error: response})
			)
		} else {
			this.setState({text})
			//TODO: escape query in the graphQL query
			API.query(/* GraphQL */`
				searchResults(f:search, q:"${text}") {
					reports { totalCount, list { ${SEARCH_CONFIG.reports.fields}} }
					people { totalCount, list { ${SEARCH_CONFIG.persons.fields}} }
					positions { totalCount, list { ${SEARCH_CONFIG.positions.fields} }}
					poams { totalCount, list { ${SEARCH_CONFIG.poams.fields} }}
					locations { totalCount, list { ${SEARCH_CONFIG.locations.fields} }}
					organizations { totalCount, list { ${SEARCH_CONFIG.organizations.fields} }}
				}
			`).then(data =>
				this.setState({results: data.searchResults})
			).catch(response => {
				this.setState({error: response})
			})
		}
	}

	static pageProps = {
		navElement:
			<div>
				<Link to="/">&lt; Return to previous page</Link>

				<RadioGroup vertical size="large" style={{width: '100%'}}>
					<Radio value="all">Everything</Radio>
					<Radio value="reports">Reports</Radio>
					<Radio value="people">People</Radio>
					<Radio value="positions">Positions</Radio>
					<Radio value="locations">Locations</Radio>
					<Radio value="organizations">Organizations</Radio>
				</RadioGroup>
			</div>
	}

	render() {
		let results = this.state.results
		let error = this.state.error
		let success = this.state.success

		let numResults = (results.reports ? results.reports.totalCount : 0) +
			(results.people ? results.people.totalCount : 0) +
			(results.positions ? results.positions.totalCount : 0) +
			(results.locations ? results.locations.totalCount : 0) +
			(results.organizations ? results.organizations.totalCount : 0)

		let noResults = numResults === 0

		let query = this.props.location.query
		let queryString = QUERY_STRINGS[query.type] || query.q || "TODO"

		if (typeof queryString === 'object') {
			queryString = queryString[Object.keys(query)[1]]
		}

		return (
			<div>
				<Breadcrumbs items={[['Searching for ' + queryString, '/search']]} />

				<Messages error={error} success={success} />

				{noResults &&
					<Alert bsStyle="warning">
						<b>No search results found!</b>
					</Alert>
				}

				{results.reports && results.reports.totalCount > 0 &&
					<div>
						<div className="pull-left">
							<h3>Reports</h3>
						</div>
						<div className="pull-right">
							{ this.props.location.query.text &&
								<DropdownButton bsStyle="primary" title="Actions" id="actions" onSelect={this.actionSelect}>
									<MenuItem eventKey="saveReportSearch">Save search</MenuItem>
								</DropdownButton>
							}
						</div>
						<br />
						<fieldset><ReportCollection reports={this.state.results.reports.list} /></fieldset>
					</div>
				}

				{results.people && results.people.totalCount > 0 &&
					<fieldset>
						<legend>People</legend>
						{this.renderPeople()}
					</fieldset>
				}

				{results.organizations && results.organizations.totalCount > 0 &&
					<fieldset>
						<legend>Organizations</legend>
						{this.renderOrgs()}
					</fieldset>
				}

				{results.positions && results.positions.totalCount > 0 &&
					<fieldset>
						<legend>Positions</legend>
						{this.renderPositions()}
					</fieldset>
				}

				{results.locations && results.locations.totalCount > 0 &&
					<fieldset>
						<legend>Locations</legend>
						{this.renderLocations()}
					</fieldset>
				}

				{results.poams && results.poams.totalCount > 0 &&
					<fieldset>
						<legend>PoAMs</legend>
						{this.renderPoams()}
					</fieldset>
				}

				{this.state.saveSearch.show && this.renderSaveModal() }
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
		search.query = this.props.location.query.q

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
					saveSearch: { show: false}
				})
				window.scrollTo(0, 0)
			})
	}

	@autobind
	actionSelect(eventKey) {
		if (eventKey === "saveReportSearch") {
			//show modal
			this.setState({saveSearch: {show: true, name: '', objectType: "reports"}});
		}
	}

	@autobind
	closeSaveModal() {
		this.setState({saveSearch: {show: false}});
	}
}
