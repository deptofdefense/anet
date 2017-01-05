import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table, DropdownButton, MenuItem} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import {browserHistory as History} from 'react-router'

import {Person, Position, Organization} from 'models'

export default class PositionShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			position: new Position( { 
				id: props.params.id
			}),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			position(id:${props.params.id}) {
				id, name, type, code,
				organization { id, name },
				person { id, name, rank },
				associatedPositions {
					id, name,
					person { id, name }
				},
				location { id, name }
			}
		`).then(data => this.setState({position: new Position(data.position)}))
	}

	render() {
		let position = this.state.position
		let breadcrumbName = position.name || 'Position'

		let assignedRole = (position.type === "ADVISOR") ? "Afghan Principals" : "Advisors";

		return (
			<div>
				<Breadcrumbs items={[[breadcrumbName, Position.pathFor(position)]]} />

				<Form static formFor={position} horizontal>
					<fieldset>
						<legend>
							{position.name}
							<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
								<MenuItem eventKey="edit" >Edit Position</MenuItem>
							</DropdownButton>
						</legend>

						<Form.Field id="code" />
						<Form.Field id="type" />

						{position.organization && <Form.Field id="org" label="Organization" >
							<Link to={Organization.pathFor(position.organization)}>
								{position.organization.name}
							</Link>
						</Form.Field>}

						{position.person && <Form.Field id="currentPerson" label="Current Assigned Person" >
							<Link to={Person.pathFor(position.person)}>
								{position.person.rank} {position.person.name}
							</Link>
						</Form.Field>}

					</fieldset>

					<fieldset>
						<legend>Assigned {assignedRole}</legend>

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Position</th>
								</tr>
							</thead>
							<tbody>
							{position.associatedPositions.map(pos =>
								this.renderAssociatedPositionRow(pos)
							)}
							</tbody>
						</Table>
					</fieldset>

					<fieldset>
						<legend>Previous Position Holders</legend>

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Dates</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td colSpan="2" className="todo">TODO</td>
								</tr>
							</tbody>
						</Table>
					</fieldset>
				</Form>
			</div>
		)
	}

	renderAssociatedPositionRow(pos) { 
		let personName = "Unfilled"
		if (pos.person) { 
			personName = <Link to={Person.pathFor(pos.person)}>{pos.person.name}</Link>
		}
		return <tr key={pos.id}>
			<td>{personName}</td>
			<td><Link to={Position.pathFor(pos)}>{pos.name}</Link></td>
		</tr>
	}

	@autobind
	actionSelect(eventKey, event) { 
		console.log(eventKey);
		let position = this.state.position;
		if (eventKey === "edit") { 
			History.push("/positions/" + position.id + "/edit")
		} else { 
			console.log("Unimplemented Action: " + eventKey);
		}
	}

}
