import React, {Component, PropTypes} from 'react'
import {Table} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import Messages from 'components/Messages'
import Autocomplete from 'components/Autocomplete'
import History from 'components/History'

import API from 'api'
import {Position} from 'models'

export default class PositionForm extends Component {
	static propTypes = {
		position: PropTypes.object.isRequired,
		edit: PropTypes.bool,
		error: PropTypes.object,
		success: PropTypes.object,
	}

	render() {
		let {position, error, success} = this.props

		let relationshipPositionType = position.type === "PRINCIPAL" ? "ADVISOR" : "PRINCIPAL"

		//TODO: only allow you to set positon to admin if you are an admin.
		console.log(position)
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

					<Form.Field id="organization" value={position.organization}>
						<Autocomplete valueKey="shortName"
							placeholder="Select the organization for this position"
							url="/api/organizations/search"
						/>
					</Form.Field>

					{position.organization && position.organization.type === "PRINCIPAL_ORG" &&
						<Form.Field id="type" type="static" value="PRINCIPAL">Afghan Principal</Form.Field>
					}

					{position.organization && position.organization.type === "ADVISOR_ORG" &&
						<Form.Field id="type" componentClass="select">
							<option value="ADVISOR">Advisor</option>
							<option value="SUPER_USER">Super User</option>
							<option value="ADMINISTRATOR">Administrator</option>
						</Form.Field>
					}

					{!position.organization.id  &&
						<Form.Field id="type" type="static" value=""><i>Select an Organization to view position types</i></Form.Field>
					}

					<Form.Field id="code" placeholder="Postion ID or Number" />
					<Form.Field id="name" label="Position Name" placeholder="Name/Description of Position"/>

					<Form.Field id="person" >
						<Autocomplete valueKey="name"
							placeholder="Select the person in this position"
							url="/api/people/search"
							queryParams={position.type ? {role: position.type} : {}}
						/>
					</Form.Field>
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
		let {organization} = position

		if (organization) {
			if (organization.type === "ADVISOR_ORG") {
				if (!position.type || position.type === "PRINCIPAL")
					position.type = "ADVISOR"
			} else if(organization.type === "PRINCIPAL_ORG") {
				position.type = "PRINCIPAL"
			}

			position.organization = {id: organization.id}
		}

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
