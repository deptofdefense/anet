import React, {Component, PropTypes} from 'react'
import {Table, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import Messages from 'components/Messages'
import Autocomplete from 'components/Autocomplete'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import History from 'components/History'

import API from 'api'
import {Position, Organization, Person} from 'models'

import REMOVE_ICON from 'resources/delete.png'

export default class PositionForm extends Component {
	static propTypes = {
		position: PropTypes.object.isRequired,
		edit: PropTypes.bool,
		error: PropTypes.object,
		success: PropTypes.object,
	}
	static contextTypes = {
		app: PropTypes.object
	}

	render() {
		let {position, error, success, edit} = this.props

		error = this.props.error || (this.state && this.state.error)

		let relationshipPositionType = position.type === 'PRINCIPAL' ? 'ADVISOR' : 'PRINCIPAL'
		let currentUser = this.context.app.state.currentUser

		let orgSearchQuery = {}
		let personSearchQuery = {}
		if (position.type === 'ADVISOR' || position.type === 'SUPER_USER' || position.type === 'ADMINISTRATOR') {
			orgSearchQuery.type = 'ADVISOR_ORG'
			personSearchQuery.role = 'ADVISOR'
			if (currentUser && currentUser.position && currentUser.position.type === 'SUPER_USER') {
				orgSearchQuery.parentOrgId = currentUser.position.organization.id
				orgSearchQuery.parentOrgRecursively = true
			}
		} else if (position.type === 'PRINCIPAL') {
			orgSearchQuery.type = 'PRINCIPAL_ORG'
			personSearchQuery.role = 'PRINCIPAL'
		}

		return (
			<Form
				formFor={position}
				onChange={this.onChange}
				onSubmit={this.onSubmit}
				submitText="Save position"
				horizontal
			>

				<Messages error={error} success={success} />

				<fieldset>
					<legend>{edit ? "Edit Position" : "Create a new Position"}</legend>

					<Form.Field id="type" disabled={this.props.edit}>
						<ButtonToggleGroup>
							<Button id="typeAdvisorButton" value="ADVISOR">Advisor (CE Billet)</Button>
							<Button id="typePrincipalButton" value="PRINCIPAL">Principal (Tashkil)</Button>
						</ButtonToggleGroup>
					</Form.Field>

					<Form.Field id="organization">
						<Autocomplete
							placeholder="Select the organization for this position"
							objectType={Organization}
							fields="id, longName, shortName"
							template={org => <span>{org.shortName} - {org.longName}</span>}
							queryParams={orgSearchQuery}
							valueKey="shortName"
						/>
					</Form.Field>

					<Form.Field id="code" placeholder="Postion ID or Number" />
					<Form.Field id="name" label="Position Name" placeholder="Name/Description of Position"/>

					<Form.Field id="person">
						<Autocomplete valueKey="name"
							placeholder="Select the person in this position"
							url="/api/people/search"
							queryParams={personSearchQuery}
						/>
					</Form.Field>

					{position.type !== 'PRINCIPAL' &&
						<Form.Field id="permissions">
							<ButtonToggleGroup>
								<Button id="permsAdvisorButton" value="ADVISOR">Advisor</Button>
								<Button id="permsSuperUserButton" value="SUPER_USER">Super User</Button>
								{currentUser && currentUser.isAdmin() &&
									<Button id="permsAdminButton" value="ADMINISTRATOR">Administrator</Button>
								}
							</ButtonToggleGroup>
						</Form.Field>
					}

				</fieldset>

				<fieldset>
					<legend>Assigned {position.type === 'PRINCIPAL' ? 'advisor' : 'advisee'}</legend>

					<p className="help-text">Advisor positions are associated with Principal positions and vice versa.</p>

					<Form.Field id="associatedPositions">
						<Autocomplete
							placeholder={'Start typing to search for ' + (position.type === 'PRINCIPAL' ? 'an advisor' : 'a principal') + ' position...'}
							objectType={Position}
							fields={'id, name, code, type, person { id, name, rank }'}
							template={pos =>
								<span>{pos.name} - {pos.code} ({(pos.person) ? pos.person.name : <i>empty</i>})</span>
							}
							onChange={this.addPositionRelationship}
							clearOnSelect={true}
							queryParams={{type: relationshipPositionType, matchPersonName: true}} />

						<Table hover striped>
							<thead>
								<tr>
									<th></th>
									<th>Name</th>
									<th>Position</th>
									<th>Org</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{Position.map(position.associatedPositions, relPos => {
									let person = new Person(relPos.person)
									return (
										<tr key={relPos.id}>
											<td>
												{person && <img src={person.iconUrl()} alt={person.role} height={20} className="person-icon" />}
											</td>

											<td>{person && person.name}</td>
											<td>{relPos.name}</td>
											<td>{relPos.organization && relPos.organization.shortName}</td>

											<td onClick={this.removePositionRelationship.bind(this, relPos)}>
												<span style={{cursor: 'pointer'}}><img src={REMOVE_ICON} height={14} alt="Unassign person" /></span>
											</td>
										</tr>
									)
								})}
							</tbody>
						</Table>
					</Form.Field>
				</fieldset>

				<fieldset>
					<legend>Additional information</legend>
					<Form.Field id="location">
						<Autocomplete valueKey="name" placeholder="Start typing to find a location where this Position will operate from..." url="/api/locations/search" />
					</Form.Field>
				</fieldset>
			</Form>
		)
	}

	@autobind
	addPositionRelationship(newRelatedPos)  {
		let position = this.props.position
		let rels = position.associatedPositions

		if (!rels.find(relPos => relPos.id === newRelatedPos.id)) {
			let newRels = rels.slice()
			newRels.push(new Position(newRelatedPos))

			position.associatedPositions = newRels
			this.onChange()
		}
	}

	@autobind
	removePositionRelationship(relToDelete) {
		let position = this.props.position
		let rels = position.associatedPositions
		let index = rels.findIndex(rel => rel.id === relToDelete.id)

		if (index !== -1) {
			rels.splice(index, 1)
			this.onChange()
		}
	}

	@autobind
	onChange() {
		this.forceUpdate()
	}

	@autobind
	onSubmit(event) {
		let {position, edit} = this.props
		position = Object.assign({}, position)

		if (position.type !== 'PRINCIPAL') {
			position.type = position.permissions || 'ADVISOR'
		}
		delete position.permissions
		position.organization = {id: position.organization.id}
		position.person = (position.person && position.person.id) ? {id: position.person.id} : null
		position.code = position.code || null //Need to null out empty position codes

		let url = `/api/positions/${edit ? 'update' : 'new'}`
		API.send(url, position, {disableSubmits: true})
			.then(response => {
				if (response.id) {
					position.id = response.id
				}

				History.replace(Position.pathForEdit(position), false)
				History.push(Position.pathFor(position), {success: 'Saved Position', skipPageLeaveWarning: true})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
