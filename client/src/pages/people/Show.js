import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Table, DropdownButton, MenuItem, FormGroup, Col, ControlLabel} from 'react-bootstrap'
import moment from 'moment'
import autobind from 'autobind-decorator'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'
import LinkTo from 'components/LinkTo'
import History from 'components/History'

import API from 'api'
import {Person} from 'models'
import Messages , {setMessages} from 'components/Messages'

export default class PersonShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
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
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			person(id:${props.params.id}) {
				id,
				name, rank, role, emailAddress, phoneNumber, biography, country, gender, endOfTourDate,
				position {
					id,
					name,
					type,
					organization {
						id, shortName
					},
					associatedPositions {
						id, name,
						person { id, name, rank },
						organization { id, shortName }
					}
				},
				authoredReports(pageNum:0,pageSize:10) { list {
					id,
					engagementDate,
					advisorOrg { id, shortName }
					intent,
					updatedAt,
					author {
						id,
						name
					}
				}},
				attendedReports(pageNum:0, pageSize:10) {{
					id,
					engagementDate,
					advisorOrg { id, shortName}
					intent,
					updatedAt,
					author {
						id,
						name
					}
				}}

			}
		`).then(data => this.setState({person: new Person(data.person)}))
	}

	render() {
		let {person} = this.state
		let position = person.position

		//User can always edit themselves, or Super Users/Admins.
		let currentUser = this.context.app.state.currentUser
		let canEdit = currentUser && (currentUser.id === person.id ||
			currentUser.isSuperUser())

		return (
			<div>
				<Breadcrumbs items={[[person.name, Person.pathFor(person)]]} />
				<Messages error={this.state.error} success={this.state.success} />

				{canEdit &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							{canEdit && <MenuItem eventKey="edit" >Edit {person.name}</MenuItem>}
						</DropdownButton>
					</div>
				}

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
						<Form.Field label="End of Tour Date" id="endOfTourDate" value={moment(person.endOfTourDate).format('D MMM YYYY')} />
						<Form.Field label="Biography" id="biography" >
							<div dangerouslySetInnerHTML={{__html: person.biography}} />
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Position</legend>
						{position && position.id &&
							this.renderPosition(position)
						}

					</fieldset>

					<fieldset>
						<legend>Reports authored</legend>
						<ReportTable reports={person.authoredReports.list} showAuthors={false} />
					</fieldset>

					<fieldset>
						<legend>Reports this person is listed as an attendee of</legend>
						<ReportTable reports={person.attendedReports.list} showAuthors={true} />
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === 'edit') {
			History.push(`/people/${this.state.person.id}/edit`)
		} else {
			console.log('Unimplemented Action: ' + eventKey)
		}
	}

	@autobind
	renderPosition(position) {
		let assocTitle = position.type === 'PRINCIPAL' ? 'Is advised by' : 'Advises'
		return <div>
			<Form.Field id="organization" label="Organization">
				<LinkTo organization={position.organization} />
			</Form.Field>
			<Form.Field id="position" label="Current Position">
				<LinkTo position={position} />
			</Form.Field>

			<FormGroup controlId="counterparts" >
				<Col sm={2} componentClass={ControlLabel}>{assocTitle}</Col>
				<Col sm={7} >
					<Table striped>
						<thead>
							<tr><th>Name</th><th>Position</th><th>Organization</th></tr>
						</thead>
						<tbody>
							{position.associatedPositions.map( assocPos =>
								<tr key={assocPos.id}>
									<td>{assocPos.person && <LinkTo person={assocPos.person} /> }</td>
									<td><LinkTo position={assocPos} /></td>
									<td><LinkTo organization={assocPos.organization} /></td>
								</tr>
							)}
						</tbody>
					</Table>
				</Col>
			</FormGroup>
		</div>
	}
}
