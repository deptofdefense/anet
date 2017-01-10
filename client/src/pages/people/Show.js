import React from 'react'
import Page from 'components/Page'
import {Table, DropdownButton, MenuItem} from 'react-bootstrap'
import moment from 'moment'
import autobind from 'autobind-decorator'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'
import LinkTo from 'components/LinkTo'
import History from 'components/History'

import API from 'api'
import {Person} from 'models'

export default class PersonShow extends Page {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			person: new Person({
				id: props.params.id,
				authoredReports: [],
				attendedReports: [],
			}),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			person(id:${props.params.id}) {
				id,
				name, rank, role, emailAddress, phoneNumber, biography, country, gender, endOfTourDate,
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
					advisorOrg { id, name }
					intent,
					updatedAt,
					author {
						id,
						name
					}
				},
				attendedReports(pageNum:0, pageSize:10) {
					id,
					engagementDate,
					advisorOrg { id, name}
					intent,
					updatedAt,
					author {
						id,
						name
					}
				}

			}
		`).then(data => this.setState({person: new Person(data.person)}))
	}

	render() {
		let {person} = this.state
		let position = person.position
		let org = position && position.organization

		let currentPositionRow = <tr><td>This person is not assigned to a position</td></tr>

		if (position) {
			currentPositionRow = <tr>
				<td>Now</td>
				<td><LinkTo organization={org} /></td>
				<td><LinkTo position={position}>{position.name}</LinkTo></td>
			</tr>
		}

		//User can always edit themselves, or Super Users/Admins.
		let currentUser = this.context.app.state.currentUser;
		let canEdit = currentUser && (currentUser.id === person.id ||
			currentUser.isSuperUser())

		return (
			<div>
				<Breadcrumbs items={[[person.name, Person.pathFor(person)]]} />

				<div className="pull-right">
					<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
						{canEdit && <MenuItem eventKey="edit" className="todo">Edit {person.name}</MenuItem>}
					</DropdownButton>
				</div>

				<Form static formFor={person} horizontal>
					<fieldset>
						<legend>{person.rank} {person.name}</legend>
						<Form.Field id="rank" />
						<Form.Field id="role" />
						<Form.Field label="Phone" id="phoneNumber" />
						<Form.Field label="Email" id="emailAddress">
							<a href={`mailto:${person.emailAddress}`}>{person.emailAddress}</a>
						</Form.Field>
						<Form.Field id="country" />
						<Form.Field id="gender" />
						<Form.Field label="End of Tour Date" id="endOfTourDate" value={moment(person.endOfTourDate).format("L")} />
						<Form.Field label="Bio" id="biography" />
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
						<legend>Reports this person is listed as an attendee of</legend>
						<ReportTable reports={person.attendedReports} showAuthors={true} />
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "edit") {
			History.push(`/people/${this.state.person.id}/edit`);
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
	}

}
