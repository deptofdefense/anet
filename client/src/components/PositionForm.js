import React, {Component} from 'react'

import {Table, Alert} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import Autocomplete from 'components/Autocomplete'
import {Position} from 'models'

export default class PositionForm extends Component {
	static propTypes = {
		position: React.PropTypes.object,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		edit: React.PropTypes.bool,
		actionText: React.PropTypes.string,
		error: React.PropTypes.object,
	}

	constructor(props) {
		super(props);

		this.state = {
			position: props.position
		}
	}

	componentWillReceiveProps(props) {
		this.setState({position: props.position})
	}

	render() {
		let {onChange, onSubmit, actionText, error} = this.props
		let position = this.state.position;
		let relationshipPositionType = (position.type === "ADVISOR") ? "PRINCIPAL" : "ADVISOR";

		//TODO: only allow you to set positon to admin if you are an admin.

		return <Form formFor={position} onChange={onChange}
				onSubmit={onSubmit} horizontal
				actionText={actionText} >

			{error &&
				<Alert bsStyle="danger">
					<p>There was a problem saving this organization</p>
					<p>{error.statusText}: {error.message}</p>
				</Alert>}

			<fieldset>
				<legend>Create a new Position</legend>

				<Form.Field id="organization" >
					<Autocomplete valueKey="shortName"
						placeholder="Select the organization for this position"
						url="/api/organizations/search"
					/>
				</Form.Field>

				{position.organization && position.organization.type === "PRINCIPAL_ORG" &&
					<Form.Field type="static" value="Afghan Principal" label="Type" id="type" /> }

				{position.organization && position.organization.type === "ADVISOR_ORG" &&
					<Form.Field id="type" componentClass="select">
						<option value="ADVISOR">Advisor</option>
						<option value="SUPER_USER">Super User</option>
						<option value="ADMINISTRATOR">Administrator</option>
					</Form.Field>
				}

				<Form.Field id="code" placeholder="Postion ID or Number" />
				<Form.Field id="name" placeholder="Name/Description of Position"/>

				<Form.Field id="person" >
					<Autocomplete valueKey="name"
						placeholder="Select the person in this position"
						url="/api/people/search"
					/>
				</Form.Field>
			</fieldset>

			<fieldset>
				<legend>Assigned Position Relationships</legend>

				<Form.Field id="associatedPositions">
					<Autocomplete
						placeholder="Assign new Position Relationship"
						url="/api/positions/search"
						valueKey="name"
						onChange={this.addPositionRelationship}
						clearOnSelect={true}
						urlParams={"&type=" + relationshipPositionType} />

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
									<span style={{cursor:'pointer'}}>Del</span>
								</td>
								<td className="todo"></td>
								<td>{relPos.name}</td>
							</tr>
						)}
						</tbody>
					</Table>
				</Form.Field>
				<div className="todo">Should be able to search by person name too, but only people in positions.... and then pull up their position... </div>
			</fieldset>

			<fieldset>
				<legend>Additional Information</legend>
				<Form.Field id="location">
					<Autocomplete valueKey="name" placeholder="Position Location" url="/api/locations/search" />
				</Form.Field>
			</fieldset>
		</Form>
	}

	@autobind
	addPositionRelationship(newRelatedPos)  {
		let position = this.state.position
		let rels = position.associatedPositions;

		if (!rels.find(relPos => relPos.id === newRelatedPos.id)) {
			rels.push(new Position(newRelatedPos))
		}
		this.setState({position})
	}

	@autobind
	removePositionRelationship(relToDelete) {
		let position = this.state.position;
		let rels = position.associatedPositions;
		let index = rels.findIndex(rel => rel.id === relToDelete.id)

		if (index !== -1) {
			rels.splice(index, 1)
			this.setState({position})
		}
	}
}
