import React from 'react'
import Page from 'components/Page'
import moment from 'moment'

import {Radio, Table} from 'react-bootstrap'
import {Link} from 'react-router'

import RadioGroup from 'components/RadioGroup'
import Breadcrumbs from 'components/Breadcrumbs'
import LinkTo from 'components/LinkTo'
import ReportSummary from 'components/ReportSummary'

import API from 'api'
import {Report, Person, Organization, Position, Poam} from 'models'

const FORMAT_EXSUM = 'exsum'
const FORMAT_TABLE = 'table'

export default class Search extends Page {
	constructor(props) {
		super(props)
		this.state = {
			query: props.location.query.q,
			viewFormat: FORMAT_EXSUM,
			results: {
				reports: [],
				people: [],
				organizations: [],
				positions: [],
				location: [],
				poams: []
			}
		}

		this.changeViewFormat = this.changeViewFormat.bind(this)
	}

	fetchData(props) {
		let query = props.location.query.q
		this.setState({query})
		//TODO: escape query in the graphQL query
		API.query(/*GraphQL */ `
			searchResults(f:search, q:"${query}") {
				reports { id, intent, engagementDate, keyOutcomesSummary, nextStepsSummary 
					primaryAdvisor { id, name, position { organization { id, name}}}, 
					primaryPrincipal { id, name, position { organization { id, name}}},
					advisorOrg { id, name},
					principalOrg { id, name},
					location { id, name},
					poams {id, shortName, longName}
				},
				people { id, name, rank, emailAddress } 
				positions { id }
				poams { id, shortName, longName}
				locations { id, name, lat, lng}
				organizations { id, name }
			}
		`).then(data => this.setState({results: data.searchResults}))
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
		let results = this.state.results;
		return (
			<div>
				<Breadcrumbs items={[['Searching for "' + this.state.query + '"', '/search']]} />

				{results.reports && results.reports.length > 0 &&
				<fieldset>
					<legend>
						Reports
						<RadioGroup value={this.state.viewFormat} onChange={this.changeViewFormat} className="pull-right">
							<Radio value={FORMAT_EXSUM}>EXSUM</Radio>
							<Radio value={FORMAT_TABLE}>Table</Radio>
						</RadioGroup>
					</legend>
					{this.state.viewFormat === FORMAT_TABLE ? this.renderTable() : this.renderExsums()}
				</fieldset>
				}

				{results.people && results.people.length > 0 &&
					<fieldset>
						<legend>People</legend>
						{this.renderPeople()}
					</fieldset>
				}

				{results.organizations && results.organizations.length > 0 &&
					<fieldset>
						<legend>Organizations</legend>
						{this.renderOrgs()}
					</fieldset>
				}

				{results.positions && results.positions.length > 0 && 
					<fieldset>
						<legend>Positions</legend>
						{this.renderPositions()}
					</fieldset>
				}
				
				{results.locations && results.locations.length > 0 && 
					<fieldset>
						<legend>Locations</legend>
						{this.renderLocations()}
					</fieldset>
				}

				{results.poams && results.poams.length > 0 && 
					<fieldset>
						<legend>Poams</legend>
						{this.renderPoams()}
					</fieldset>
				}

			</div>
		)
	}

	renderTable() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Date</th>
					<th>AO</th>
					<th>Summary</th>
				</tr>
			</thead>
			<tbody>
				{Report.map(this.state.results.reports, report =>
					<tr key={report.id}>
						<td><LinkTo report={report}>{moment(report.engagementDate).format('L')}</LinkTo></td>
						<td>TODO</td>
						<td>{report.intent}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}

	renderExsums() {
		console.log(this.state.results.reports)
		return <Table responsive>
			<tbody>
				{this.state.results.reports.map(report => 
					<tr key={report.id}>
						<td><ReportSummary report={report} /></td>
					</tr>
				)}
			</tbody>
		</Table>
	}

	renderPeople() {
		return <Table responsive hover striped>
			<thead>
				<tr>
					<th>Name</th>
					<th>Role</th>
					<th>Phone</th>
					<th>Email</th>
				</tr>
			</thead>
			<tbody>
				{Person.map(this.state.results.people, person =>
					<tr key={person.id}>
						<td><LinkTo person={person}>{person.rank} {person.name}</LinkTo></td>
						<td>{person.role}</td>
						<td>{person.phoneNumber}</td>
						<td>{person.emailAddress}</td>
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
					<th>Type</th>
				</tr>
			</thead>
			<tbody>
				{Organization.map(this.state.results.organizations, org =>
					<tr key={org.id}>
						<td><LinkTo organization={org} /></td>
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
					<th>Type</th>
				</tr>
			</thead>
			<tbody>
				{Position.map(this.state.results.positions, pos =>
					<tr key={pos.id}>
						<td><LinkTo position={pos} >{pos.code} {pos.name}</LinkTo></td>
						<td>{pos.type}</td>
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
				{this.state.results.locations.map(loc =>
					<tr key={loc.id}>
						<td><Link to={"/locations/" + loc.id}>{loc.name}</Link></td>
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
				{Poam.map(this.state.results.poams, poam =>
					<tr key={poam.id}>
						<td><LinkTo poam={poam} >{poam.shortName} {poam.longName}</LinkTo></td>
					</tr>
				)}
			</tbody>
		</Table>

	}

	changeViewFormat(newFormat) {
		this.setState({viewFormat: newFormat})
	}
}
