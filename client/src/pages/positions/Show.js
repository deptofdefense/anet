import React, {PropTypes} from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'
import moment from 'moment'
import utils from 'utils'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import Messages , {setMessages} from 'components/Messages'
import LinkTo from 'components/LinkTo'

import API from 'api'
import {Person, Position, Organization} from 'models'

class PositionShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	static modelName = 'Position'

	constructor(props) {
		super(props)
		this.state = {
			position: new Position( {
				id: props.params.id,
				previousPeople: []
			}),
		}
		setMessages(props,this.state)
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
		let assignedRole = (position.type === 'ADVISOR') ? 'Afghan Principals' : 'Advisors'

		let currentUser = this.context.app.state.currentUser
		let canEdit = currentUser && (
			//Super Users can edit any Principal
			(currentUser.isSuperUser() && position.type === 'PRINCIPAL') ||
			//Admins can edit anybody
			(currentUser.isAdmin()) ||
			//Super users can edit positions within their own organization
			(position.organization && position.organization.id && currentUser.isSuperUserForOrg(position.organization)))
		return (
			<div>
				<Breadcrumbs items={[[position.name || 'Position', Position.pathFor(position)]]} />
				<Messages success={this.state.success} error={this.state.error} />

				<Form static formFor={position} horizontal>
					<Fieldset title={position.name} action={
						canEdit && <LinkTo position={position} edit button="primary">Edit</LinkTo>
					}>
						<Form.Field id="code" />

						<Form.Field id="type">
							{position.type === "PRINCIPAL" ? "Principal" : `NATO ${utils.sentenceCase(position.type)}`}
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

						{position.person && <Form.Field id="person" label="Current Assigned Person" value={position.person && position.person.name} >
							<Link to={Person.pathFor(position.person)}>
								{position.person.rank} {position.person.name}
							</Link>
						</Form.Field>}

					</Fieldset>

					<Fieldset title={`Assigned ${assignedRole}`}>
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
					</Fieldset>

					<Fieldset title="Previous position holders">
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
}

export default ModelPage(PositionShow)
