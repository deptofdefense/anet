import React from 'react'
import Page from 'components/Page'
import {Table} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Autocomplete from 'components/Autocomplete'
import History from 'components/History'

import API from 'api'
import {Position, Organization} from 'models'

export default class PositionNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			position:  new Position(),
		}
	}

	fetchData(props) {
		API.query( /*GraphQL */`
			organization(id:${props.location.query.organizationId}) {
				id, name, type
			}
		`).then(data => {
			let organization = new Organization(data.organization)
			this.setState({
				position : new Position({
					type: organization.isAdvisorOrg() ? 'ADVISOR' : 'PRINCIPAL',
					organization: organization,
				})
			})
		})
	}

	render() {
		let position = this.state.position
		let relationshipPositionType = (position.type === "ADVISOR") ? "PRINCIPAL" : "ADVISOR";

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Position</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Position', Position.pathForNew()]]} />

				<Form formFor={position} onChange={this.onChange} onSubmit={this.onSubmit} horizontal>
					{this.state.error && <fieldset><p>There was a problem saving this position</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Position</legend>

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

						<Form.Field type="static" value={position.organization.name} label="Organization" id="org" />
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
			</div>
		)
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

	@autobind
	onChange() {
		let position = this.state.position
		this.setState({position})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let position = this.state.position 
		console.log(position)
		API.send('/api/positions/new', position, {disableSubmits: true})
			.then(response => {
				History.push("/positions/" + response.id);
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
