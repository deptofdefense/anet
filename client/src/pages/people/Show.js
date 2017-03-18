import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Table, FormGroup, Col, ControlLabel, Button} from 'react-bootstrap'
import moment from 'moment'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'
import LinkTo from 'components/LinkTo'
import Messages, {setMessages} from 'components/Messages'
import AssignPositionModal from 'components/AssignPositionModal'

import GuidedTour from 'components/GuidedTour'
import {personTour} from 'pages/HopscotchTour'

import API from 'api'
import {Person, Position} from 'models'
import autobind from 'autobind-decorator'

export default class PersonShow extends Page {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	static modelName = 'User'

	constructor(props) {
		super(props)
		this.state = {
			person: new Person({
				id: props.params.id,
				authoredReports: [],
				attendedReports: [],
			}),
			showAssignPositionModal: false,
		}
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			person(id:${props.params.id}) {
				id,
				name, rank, role, status, emailAddress, phoneNumber, biography, country, gender, endOfTourDate,
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
					id, engagementDate, intent, updatedAt, state, cancelledReason
					advisorOrg { id, shortName }
					author { id, name }
				}},
				attendedReports(pageNum:0, pageSize:10) { list {
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

		//User can always edit themselves
		//Admins can always edit anybody
		//SuperUsers can edit people in their org, their descendant orgs, or un-positioned people.
		let currentUser = this.context.currentUser
		let canEdit = Person.isEqual(currentUser, person) ||
			currentUser.isAdmin() ||
			(position && currentUser.isSuperUserForOrg(position.organization)) ||
			(!position && currentUser.isSuperUser()) ||
			(person.role === 'PRINCIPAL' && currentUser.isSuperUser())

		return (
			<div>
				<div className="pull-right">
					<GuidedTour
						tour={personTour}
						autostart={localStorage.newUser === 'true' && localStorage.hasSeenPersonTour !== 'true'}
						onEnd={() => localStorage.hasSeenPersonTour = 'true'}
					/>
				</div>

				<Breadcrumbs items={[[person.name, Person.pathFor(person)]]} />
				<Messages error={this.state.error} success={this.state.success} />

				<Form static formFor={person} horizontal>
					<Fieldset title={`${person.rank} ${person.name}`} action={
						canEdit && <LinkTo person={person} edit button="primary">Edit</LinkTo>
					}>

						<Form.Field id="rank" />

						<Form.Field id="role">{person.humanNameOfRole()}</Form.Field>

						<Form.Field id="status">{person.humanNameOfStatus()}</Form.Field>

						<Form.Field label="Phone" id="phoneNumber" />
						<Form.Field label="Email" id="emailAddress">
							<a href={`mailto:${person.emailAddress}`}>{person.emailAddress}</a>
						</Form.Field>

						<Form.Field id="country" />
						<Form.Field id="gender" />

						<Form.Field label="End of tour" id="endOfTourDate" value={person.endOfTourDate && moment(person.endOfTourDate).format('D MMM YYYY')} />

						<Form.Field label="Biography" id="biography" >
							<div dangerouslySetInnerHTML={{__html: person.biography}} />
						</Form.Field>
					</Fieldset>



					<Fieldset title="Current position" id="current-position" className={(!position || !position.id) && 'warning'} action={currentUser.isSuperUser() && <div><Button onClick={this.showAssignPositionModal}>Edit</Button></div>}>
						{position && position.id
							? this.renderPosition(position)
							: this.renderPositionBlankSlate(person)
						}
						{currentUser.isSuperUser() &&
							<AssignPositionModal
								showModal={this.state.showAssignPositionModal}
								person={person}
								onCancel={this.hideAssignPositionModal.bind(this, false)}
								onSuccess={this.hideAssignPositionModal.bind(this, true)}
							/>
						}
					</Fieldset>

					{person.isAdvisor() &&
						<Fieldset title="Reports authored" id="reports-authored">
							<ReportTable reports={person.authoredReports.list || []} showAuthors={false} />
						</Fieldset>
					}

					<Fieldset title={`Reports attended by ${person.name}`} id="reports-attended">
						<ReportTable reports={person.attendedReports.list || []} showAuthors={true} />
					</Fieldset>
				</Form>
			</div>
		)
	}

	renderPosition(position) {
		let assocTitle = position.type === 'PRINCIPAL' ? 'Is advised by' : 'Advises'
		return <div>
			<Form.Field id="organization" label="Organization">
				<LinkTo organization={position.organization} />
			</Form.Field>
			<Form.Field id="position" label="Position">
				<LinkTo position={position} />
			</Form.Field>

			<FormGroup controlId="counterparts">
				<Col sm={2} componentClass={ControlLabel}>{assocTitle}</Col>
				<Col sm={9}>
					<Table>
						<thead>
							<tr><th>Name</th><th>Position</th><th>Organization</th></tr>
						</thead>
						<tbody>
							{Position.map(position.associatedPositions, assocPos =>
								<tr key={assocPos.id}>
									<td>{assocPos.person && <LinkTo person={assocPos.person} />}</td>
									<td><LinkTo position={assocPos} /></td>
									<td><LinkTo organization={assocPos.organization} /></td>
								</tr>
							)}
						</tbody>
					</Table>

					{position.associatedPositions.length === 0 && <em>{position.name} has no counterparts assigned</em>}
				</Col>
			</FormGroup>
		</div>
	}

	renderPositionBlankSlate(person) {
		let currentUser = this.context.currentUser

		if (Person.isEqual(currentUser, person)) {
			return <em>You are not assigned to a position. Contact your organization's super user to be added.</em>
		} else {
			return <div style={{textAlign: 'center'}}>
				<p><em>{person.name} is not assigned to a position.</em></p>
				{currentUser.isSuperUser() &&
					<p><Button onClick={this.showAssignPositionModal}>Assign position</Button></p>
				}
			</div>
		}
	}

	@autobind
	showAssignPositionModal() {
		this.setState({showAssignPositionModal: true})
	}

	@autobind
	hideAssignPositionModal(success) {
		this.setState({showAssignPositionModal: false})
		if (success) {
			this.fetchData(this.props)
		}
	}
}
