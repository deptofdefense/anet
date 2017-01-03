import React from 'react'
import Page from 'components/Page'
import {Table} from 'react-bootstrap'
import {Link} from 'react-router'
import moment from 'moment'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'

export default class PersonShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			person: {
				authoredReports: [],
				attendedReports: []
			},
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			person(id:${props.params.id}) {
				id,
				name, rank, role, emailAddress, phoneNumber, biography, country, gender, endOfTourDate
				position {
					id,
					name,
					organization {
						id,
						name
					}
				},
				authoredReports(pageNum:0,pageSize:10) {
					id,
					engagementDate,
					intent,
					author {
						id,
						name
					}
				},
				attendedReports(pageNum:0, pageSize:10) {
					id,
					engagementDate,
					intent,
					author {
						id,
						name
					}
				}

			}
		`).then(data => this.setState({person: data.person}))
	}

	render() {
		let {person} = this.state
		let position = person.position
		let org = position && position.organization

		let currentPositionRow = <tr><td>This person is not assigned to a position</td></tr>;

		if (position) {
			currentPositionRow = <tr>
				<td>Now</td>
				<td>{org && <Link to={`/organizations/${org.id}`}>{org.name}</Link>}</td>
				<td>{position.name}</td>
			</tr>
		}

		return (
			<div>
				<Breadcrumbs items={[[person.name, "/people/" + person.id ]]} />
				<Form formFor={person} horizontal>
					<fieldset>
						<legend>{person.rank} {person.name}</legend>
						<Form.Field type="static" id="rank" />
						<Form.Field type="static" id="role" />
						<Form.Field label="Phone" type="static" id="phoneNumber" />
						<Form.Field label="Email" type="static" id="emailAddress">
							<a href={`mailto:${person.emailAddress}`}>{person.emailAddress}</a>
						</Form.Field>
						<Form.Field type="static" id="country" />
						<Form.Field type="static" id="gender" />
						<Form.Field label="End of Tour Date" type="static" id="endOfTourDate" value={moment(person.endOfTourDate).format("L")} />
						<Form.Field label="Bio" type="static" id="person.biography" />
					</fieldset>

					<fieldset>
						<legend>Positions</legend>
						<Table>
							<thead>
							<tr><th>Date</th><th>Org</th><th>Position</th></tr>
							</thead>
							<tbody>
								{currentPositionRow}
								<tr><td colSpan="3" className="todo">TODO: Previous Positions</td></tr>
							</tbody>
						</Table>
					</fieldset>

					<fieldset>
						<legend>Reports authored</legend>
						<ReportTable reports={person.authoredReports} showAuthors={false} />
					</fieldset>

					<fieldset>
						<legend>Reports involving this person</legend>
						<ReportTable reports={person.attendedReports} showAuthors={true} />
					</fieldset>
				</Form>
			</div>
		)
	}
}
