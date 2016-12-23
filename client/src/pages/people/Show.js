import React from 'react'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'
import moment from 'moment'

import API from '../../api'
import Breadcrumbs from '../../components/Breadcrumbs'
import Form from '../../components/Form'
import FormField from '../../components/FormField'

export default class PersonShow extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			person: {},
		}
	}

	componentDidMount() {
		API.query(`
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

		let position = "This person is not assigned to a position";
		if (person.position) { 
			position = <tr><td>Now</td><td>{person.position.organization && person.position.organization.name}</td><td>{person.position.name}</td></tr>;
		}

		return (
			<div>
				<Form formFor={person} horizontal>
					<fieldset>
						<legend>{person.rank} {person.name}</legend>
						<FormField label="Rank" type="static" id="rank" />
						<FormField label="Role" type="static" id="role" />
						<FormField label="Phone" type="static" id="phoneNumber" />
						<FormField label="Email" type="static" id="emailAddress" />
						<FormField label="Bio" type="static" id="person.biography" />
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
						<legend>Reports</legend>
						<Table>
							<thead>
								<tr>
									<th>Date</th>
									<th>AO</th>
									<th>Summary</th>
								</tr>
							</thead>
							<tbody>
							{person.authoredReports && person.authoredReports.map( report =>
								<tr key={report.id} >
									<td><Link to={"/reports/" + report.id}>{moment(report.engagementDate).format('L')}</Link></td>
									<td>TODO</td>
									<td>{report.intent}</td>
								</tr>
							)}
							</tbody>
						</Table>
					</fieldset>
				</Form>
			</div>
		)
	}
}
