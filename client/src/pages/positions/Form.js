import React, {Component, PropTypes} from 'react'
import {Table, Radio} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import Messages from 'components/Messages'
import Autocomplete from 'components/Autocomplete'
import RadioGroup from 'components/RadioGroup'
import History from 'components/History'

import API from 'api'
import {Position, Organization} from 'models'

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
		let {position, error, success} = this.props

		let relationshipPositionType = position.type === "PRINCIPAL" ? "ADVISOR" : "PRINCIPAL"
		let currentUser = this.context.app.state.currentUser

		let orgSearchQuery = {}
		if (position.type === "ADVISOR") {
			orgSearchQuery.type = "ADVISOR_ORG"
			if (currentUser && currentUser.position && currentUser.position.type === "SUPER_USER") {
				orgSearchQuery.parentOrgId = currentUser.position.organization.id
				orgSearchQuery.parentOrgRecursively = true
			}
		} else if (position.type === "PRINCIPAL") {
			orgSearchQuery.type = "PRINCIPAL_ORG"
		}

		if (!position.permissions) {
			position.permissions = position.type
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
					<legend>Create a new Position</legend>

					<Form.Field id="type" disabled={this.props.edit}>
						<RadioGroup>
							<Radio value="ADVISOR">Advisor (CE Billet)</Radio>
							<Radio value="PRINCIPAL">Principal (Tashkil)</Radio>
						</RadioGroup>
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
							queryParams={position.type ? {role: position.type} : {}}
						/>
					</Form.Field>

					{position.type !== "PRINCIPAL" &&
						<Form.Field id="permissions">
							<RadioGroup>
								<Radio value="ADVISOR">Advisor</Radio>
								<Radio value="SUPER_USER">Super User</Radio>
								{currentUser && currentUser.isAdmin() &&
									<Radio value="ADMINISTRATOR">Administrator</Radio>
								}
							</RadioGroup>
						</Form.Field>
					}

				</fieldset>

				<fieldset>
					<legend>Assigned Position Relationships</legend>

					<Form.Field id="associatedPositions">
						<Autocomplete
							placeholder="Assign new Position Relationship"
							objectType={Position}
							fields={"id, name, code, type, person { id, name, rank }"}
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
								</tr>
							</thead>
							<tbody>
								{Position.map(position.associatedPositions, relPos =>
									<tr key={relPos.id}>
										<td onClick={this.removePositionRelationship.bind(this, relPos)}>
											<span style={{cursor: 'pointer'}}>⛔️</span>
										</td>
										<td>{relPos.person && relPos.person.name}</td>
										<td>{relPos.name}</td>
									</tr>
								)}
							</tbody>
						</Table>
					</Form.Field>
				</fieldset>

				<fieldset>
					<legend>Additional Information</legend>
					<Form.Field id="location">
						<Autocomplete valueKey="name" placeholder="Position Location" url="/api/locations/search" />
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

		if (position.type !== "PRINCIPAL") {
			position.type = position.permissions || "ADVISOR"
		}
		delete position.permissions

		let url = `/api/positions/${edit ? 'update' : 'new'}`
		API.send(url, position, {disableSubmits: true})
			.then(response => {
				if (response.id) {
					position.id = response.id
				}

				History.replace(Position.pathForEdit(position), false)
				History.push(Position.pathFor(position), {success: "Saved Position"})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
