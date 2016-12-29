import React from 'react'
import {Table} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'

export default class PersonShow extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			person: { authoredReports: [], attendedReports: []},
		}
	}

	componentDidMount() {
		API.query(/* GraphQL */`
			person(id:${this.props.params.id}) {
				id,
				name, rank, role, emailAddress, phoneNumber, biography,
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

		let position = <tr><td>This person is not assigned to a position</td></tr>;
		if (person.position) {
			position = <tr><td>Now</td><td>{person.position.organization && person.position.organization.name}</td><td>{person.position.name}</td></tr>;
		}

		return (
			<div>
				<Breadcrumbs items={[[person.name, "/people/" + person.id ]]} />
				<Form formFor={person} horizontal>
					<fieldset>
						<legend>{person.rank} {person.name}</legend>
						<Form.Field label="Rank" type="static" id="rank" />
						<Form.Field label="Role" type="static" id="role" />
						<Form.Field label="Phone" type="static" id="phoneNumber" />
						<Form.Field label="Email" type="static" id="emailAddress">
							<a href={`mailto:${person.emailAddress}`}>{person.emailAddress}</a>
						</Form.Field>
						<Form.Field label="Bio" type="static" id="person.biography" />
					</fieldset>

					<fieldset>
						<legend>Positions</legend>
						<Table>
							<thead>
							<tr><th>Date</th><th>Org</th><th>Position</th></tr>
							</thead>
							<tbody>
								{position}
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
