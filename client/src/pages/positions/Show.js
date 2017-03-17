import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table, Button} from 'react-bootstrap'
import moment from 'moment'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import Messages, {setMessages} from 'components/Messages'
import AssignPersonModal from 'components/AssignPersonModal'

import GuidedTour from 'components/GuidedTour'
import {positionTour} from 'pages/HopscotchTour'

import API from 'api'
import {Position, Organization} from 'models'
import autobind from 'autobind-decorator'

export default class PositionShow extends Page {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	static modelName = 'Position'

	constructor(props) {
		super(props)

		this.state = {
			position: new Position( {
				id: props.params.id,
				previousPeople: [],
				associatedPositions: [],
				showAssignPersonModal: false,
			}),
		}

		setMessages(props, this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			position(id:${props.params.id}) {
				id, name, type, status, code,
				organization { id, shortName, longName },
				person { id, name, rank },
				associatedPositions {
					id, name,
					person { id, name, rank }
				},
				previousPeople { startTime, endTime, person { id, name, rank }}
				location { id, name }
			}
		`).then(data => this.setState({position: new Position(data.position)}))
	}

	render() {
		let position = this.state.position
		let assignedRole = position.type === 'PRINCIPAL' ? 'advisors' : 'Afghan principals'

		let currentUser = this.context.currentUser
		let canEdit =
			//Super Users can edit any Principal
			(currentUser.isSuperUser() && position.type === 'PRINCIPAL') ||
			//Admins can edit anybody
			(currentUser.isAdmin()) ||
			//Super users can edit positions within their own organization
			(position.organization && position.organization.id && currentUser.isSuperUserForOrg(position.organization))

		return (
			<div>
				<div className="pull-right">
					<GuidedTour
						tour={positionTour}
						autostart={localStorage.newUser === 'true' && localStorage.hasSeenPositionTour !== 'true'}
						onEnd={() => localStorage.hasSeenPositionTour = 'true'}
					/>
				</div>

				<Breadcrumbs items={[[position.name || 'Position', Position.pathFor(position)]]} />
				<Messages success={this.state.success} error={this.state.error} />

				<Form static formFor={position} horizontal>
					<Fieldset title={position.name} action={
						canEdit && <LinkTo position={position} edit button="primary">Edit</LinkTo>
					}>
						<Form.Field id="code" />

						<Form.Field id="type">
							{position.humanNameOfType()}
						</Form.Field>

						<Form.Field id="status" />

						{position.organization && <Form.Field id="organization" label="Organization" value={position.organization && position.organization.shortName} >
							<Link to={Organization.pathFor(position.organization)}>
								{position.organization.shortName} {position.organization.longName}
							</Link>
						</Form.Field>}

						<Form.Field id="location" label="Location">
							{position.location && <LinkTo location={position.location}>{position.location.name}</LinkTo>}
						</Form.Field>
					</Fieldset>

					<Fieldset title="Current assigned person"
						id="assigned-advisor"
						className={(!position.person || !position.person.id) && 'warning'}
						style={{textAlign: 'center'}}
						action={canEdit && <Button onClick={this.showAssignPersonModal}>Change assigned person</Button>} >
						{position.person && position.person.id
							? <div>
								<h4><LinkTo person={position.person}>{position.person.rank} {position.person.name}</LinkTo></h4>
								<p></p>
							</div>
							: <div>
								<p><em>{position.name} is currently empty.</em></p>
							</div>
						}
						<AssignPersonModal
							position={position}
							showModal={this.state.showAssignPersonModal}
							onCancel={this.hideAssignPersonModal.bind(this, false)}
							onSuccess={this.hideAssignPersonModal.bind(this, true)}
						/>
					</Fieldset>

					<Fieldset title={`Assigned ${assignedRole}`} id="assigned-principal">
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Position</th>
								</tr>
							</thead>
							<tbody>
								{Position.map(position.associatedPositions, (pos, idx) =>
									this.renderAssociatedPositionRow(pos, idx)
								)}
							</tbody>
						</Table>

						{position.associatedPositions.length === 0 &&
							<em>{position.name} has no associated {assignedRole}</em>
						}
					</Fieldset>

					<Fieldset title="Previous position holders" id="previous-people">
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Dates</th>
								</tr>
							</thead>
							<tbody>
								{position.previousPeople.map( (pp, idx) =>
									<tr key={idx} id={`previousPerson_${idx}`}>
										<td><LinkTo person={pp.person} /></td>
										<td>
											{moment(pp.startTime).format('D MMM YYYY')} - &nbsp;
											{pp.endTime && moment(pp.endTime).format('D MMM YYYY')}
										</td>
									</tr>
								)}
							</tbody>
						</Table>
					</Fieldset>
				</Form>
			</div>
		)
	}

	renderAssociatedPositionRow(pos, idx) {
		let personName = 'Unfilled'
		if (pos.person) {
			personName = <LinkTo person={pos.person} />
		}
		return <tr key={pos.id} id={`associatedPosition_${idx}`}>
			<td>{personName}</td>
			<td><Link to={Position.pathFor(pos)}>{pos.name}</Link></td>
		</tr>
	}

	@autobind
	showAssignPersonModal() {
		this.setState({showAssignPersonModal: true})
	}

	@autobind
	hideAssignPersonModal(success) {
		this.setState({showAssignPersonModal: false})
		if (success) {
			this.fetchData(this.props)
		}
	}
}
