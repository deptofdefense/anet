import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Table, FormGroup, Col, ControlLabel, Button} from 'react-bootstrap'
import moment from 'moment'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportCollection from 'components/ReportCollection'
import LinkTo from 'components/LinkTo'
import Messages, {setMessages} from 'components/Messages'
import AssignPositionModal from 'components/AssignPositionModal'
import EditAssociatedPositionsModal from 'components/EditAssociatedPositionsModal'

import GuidedTour from 'components/GuidedTour'
import {personTour} from 'pages/HopscotchTour'

import {Person, Position} from 'models'
import autobind from 'autobind-decorator'
import GQL from 'graphqlapi'
import dict from 'dictionary'

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
			}),
			authoredReports: null,
			attendedReports: null,
			showAssignPositionModal: false,
			showAssociatedPositionsModal: false,
		}

		this.authoredReportsPageNum = 0
		this.attendedReportsPageNum = 0
		setMessages(props,this.state)
	}

	getAuthoredReportsPart(personId) {
		let query = {
			pageNum: this.authoredReportsPageNum,
			pageSize: 10,
			authorId : personId
		}
		let part = new GQL.Part(/* GraphQL */`
			authoredReports: reportList(query: $authorQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}`)
			.addVariable("authorQuery", "ReportSearchQuery", query)
		return part
	}

	getAttendedReportsPart(personId) {
		let query = {
			pageNum: this.attendedReportsPageNum,
			pageSize: 10,
			attendeeId: personId
		}
		let part = new GQL.Part(/* GraphQL */ `
			attendedReports: reportList(query: $attendeeQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}`)
			.addVariable("attendeeQuery", "ReportSearchQuery", query)
		return part
	}

	fetchData(props) {
		let personPart = new GQL.Part(/* GraphQL */`
			person(id:${props.params.id}) {
				id,
				name, rank, role, status, emailAddress, phoneNumber,
				biography, country, gender, endOfTourDate,
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
				}
			}`)
		let authoredReportsPart = this.getAuthoredReportsPart(props.params.id)
		let attendedReportsPart = this.getAttendedReportsPart(props.params.id)

		GQL.run([personPart, authoredReportsPart, attendedReportsPart]).then(data =>
			this.setState({
				person: new Person(data.person),
				authoredReports: data.authoredReports,
				attendedReports: data.attendedReports
			})
		)
	}

	render() {
		let {person,attendedReports,authoredReports} = this.state
		let position = person.position

		// The position for this person's counterparts
		let assignedRole = position.type === Position.TYPE.PRINCIPAL ? dict.lookup('ADVISOR_PERSON_TITLE') : dict.lookup('PRINCIPAL_PERSON_TITLE')

		//User can always edit themselves
		//Admins can always edit anybody
		//SuperUsers can edit people in their org, their descendant orgs, or un-positioned people.
		let currentUser = this.context.currentUser
		let hasPosition = position && position.id
		let canEdit = Person.isEqual(currentUser, person) ||
			currentUser.isAdmin() ||
			(hasPosition && currentUser.isSuperUserForOrg(position.organization)) ||
			(!hasPosition && currentUser.isSuperUser()) ||
			(person.role === 'PRINCIPAL' && currentUser.isSuperUser())
		let canChangePosition = currentUser.isAdmin() ||
			(!hasPosition && currentUser.isSuperUser()) ||
			(hasPosition && currentUser.isSuperUserForOrg(position.organization)) ||
			(person.role === 'PRINCIPAL' && currentUser.isSuperUser())

		return (
			<div>
				<div className="pull-right">
					<GuidedTour
						title="Take a guided tour of this person's page."
						tour={personTour}
						autostart={localStorage.newUser === 'true' && localStorage.hasSeenPersonTour !== 'true'}
						onEnd={() => localStorage.hasSeenPersonTour = 'true'}
					/>
				</div>

				<Breadcrumbs items={[[person.name, Person.pathFor(person)]]} />
				<Messages error={this.state.error} success={this.state.success} />

				<Form static formFor={person} horizontal>
					<Fieldset title={`${person.rank} ${person.name}`} action={
						canEdit && <LinkTo person={person} edit button="primary" className="edit-person">Edit</LinkTo>
					}>

						<Form.Field id="rank" />

						<Form.Field id="role">{person.humanNameOfRole()}</Form.Field>

						<Form.Field id="status">{person.humanNameOfStatus()}</Form.Field>

						<Form.Field label="Phone" id="phoneNumber" />
						<Form.Field label="Email" id="emailAddress">
							<a href={`mailto:${person.emailAddress}`}>{person.emailAddress}</a>
						</Form.Field>

						<Form.Field label="Nationality" id="country" />
						<Form.Field id="gender" />

						<Form.Field label="End of tour" id="endOfTourDate" value={person.endOfTourDate && moment(person.endOfTourDate).format('D MMM YYYY')} />

						<Form.Field label="Biography" id="biography" >
							<div dangerouslySetInnerHTML={{__html: person.biography}} />
						</Form.Field>
					</Fieldset>



					<Fieldset title="Position" >
						<Fieldset title="Current Position" id="current-position"
							className={(!position || !position.id) && 'warning'}
							action={position && position.id && canChangePosition &&
								<div>
									<LinkTo position={position} edit button="default" >Edit position details</LinkTo>
									<Button onClick={this.showAssignPositionModal} className="change-assigned-position">
										Change assigned position
									</Button>
								</div>}>
							{position && position.id
								? this.renderPosition(position)
								: this.renderPositionBlankSlate(person)
							}
							{canChangePosition &&
								<AssignPositionModal
									showModal={this.state.showAssignPositionModal}
									person={person}
									onCancel={this.hideAssignPositionModal.bind(this, false)}
									onSuccess={this.hideAssignPositionModal.bind(this, true)}
								/>
							}
						</Fieldset>

						{position && position.id &&
							<Fieldset title={`Assigned ${assignedRole}`} action={canChangePosition && <Button onClick={this.showAssociatedPositionsModal}>Change assigned {assignedRole}</Button>}>
								{this.renderCounterparts(position)}
								{canChangePosition &&
									<EditAssociatedPositionsModal
										position={position}
										showModal={this.state.showAssociatedPositionsModal}
										onCancel={this.hideAssociatedPositionsModal.bind(this, false)}
										onSuccess={this.hideAssociatedPositionsModal.bind(this, true)}
									/>
								}
							</Fieldset>
						}
					</Fieldset>

					{person.isAdvisor() && authoredReports &&
						<Fieldset title="Reports authored" id="reports-authored">
							<ReportCollection
								paginatedReports={authoredReports}
								goToPage={this.goToAuthoredPage}
							 />
						</Fieldset>
					}

					{attendedReports &&
						<Fieldset title={`Reports attended by ${person.name}`} id="reports-attended">
							<ReportCollection
								paginatedReports={attendedReports}
								goToPage={this.goToAttendedPage}
							/>
						</Fieldset>
					}
				</Form>
			</div>
		)
	}

	renderPosition(position) {
		return <div style={{textAlign: 'center'}}>
					<h4>
						<LinkTo position={position} className="position-name" />  (<LinkTo organization={position.organization} />)
					</h4>
			</div>
	}

	renderCounterparts(position) {
		let assocTitle = position.type === Position.TYPE.PRINCIPAL ? 'Is advised by' : 'Advises'
		return <FormGroup controlId="counterparts">
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
	}

	renderPositionBlankSlate(person) {
		let currentUser = this.context.currentUser
		//when the person is not in a position, any super user can assign them.
		let canChangePosition = currentUser.isSuperUser()

		if (Person.isEqual(currentUser, person)) {
			return <em>You are not assigned to a position. Contact your organization's super user to be added.</em>
		} else {
			return <div style={{textAlign: 'center'}}>
				<p className="not-assigned-to-position-message"><em>{person.name} is not assigned to a position.</em></p>
				{canChangePosition &&
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

	@autobind
	showAssociatedPositionsModal() {
		this.setState({showAssociatedPositionsModal: true})
	}

	@autobind
	hideAssociatedPositionsModal(success) {
		this.setState({showAssociatedPositionsModal: false})
		if (success) {
			this.fetchData(this.props)
		}
	}

	@autobind
	goToAuthoredPage(pageNum) {
		this.authoredReportsPageNum = pageNum
		let part = this.getAuthoredReportsPart(this.state.person.id)
		GQL.run([part]).then(data =>
			this.setState({authoredReports: data.authoredReports})
		)
	}

	@autobind
	goToAttendedPage(pageNum) {
		this.attendedReportsPageNum = pageNum
		let part = this.getAttendedReportsPart(this.state.person.id)
		GQL.run([part]).then(data =>
			this.setState({attendedReports: data.attendedReports})
		)
	}
}
