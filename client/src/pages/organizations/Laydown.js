import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Table, ListGroup, ListGroupItem, DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import History from 'components/History'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'

import API from 'api'
import {Organization, Position} from 'models'

export default class OrganizationLaydown extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			organization: {
				id: props.params.id,
				positions: [],
			},
		}
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			organization(id:${props.params.id}) {
				id, shortName, longName, type
				parentOrg { id, shortName, longName }
				positions {
					id, name, code
					person { id, name }
					associatedPositions {
						id, name, code
						person { id, name }
					}
				},
				childrenOrgs { id, shortName, longName },
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization

		let positionsNeedingAttention = org.positions.filter(position => !position.person )
		let supportedPositions = org.positions.filter(position => positionsNeedingAttention.indexOf(position) === -1)

		let currentUser = this.context.app.state.currentUser
		let isSuperUser = (currentUser) ? currentUser.isSuperUserForOrg(org) : false
		let isAdmin = (currentUser) ? currentUser.isAdmin() : false
		let showActions = isAdmin || isSuperUser

		return (
			<div>
				<Breadcrumbs items={[[org.shortName || 'Organization', Organization.pathFor(org)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				{ showActions &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							{isSuperUser && <MenuItem eventKey="edit" >Edit Organization</MenuItem>}
							{isAdmin && <MenuItem eventKey="createSub">Create Sub-Organization</MenuItem> }
							{isAdmin && <MenuItem eventKey="createPoam">Create Poam</MenuItem> }
							{isSuperUser && <MenuItem eventKey="createPos">Create new Position</MenuItem> }
						</DropdownButton>
					</div>
				}

				<Form static formFor={org} horizontal>
					<fieldset>
						<legend>
							{org.shortName}
						</legend>

						<Form.Field id="longName" label="Description"/>

						<Form.Field id="type">
							{org.type && org.type.split('_')[0]}
						</Form.Field>

						{org.parentOrg && org.parentOrg.id &&
							<Form.Field id="parentOrg" label="Parent">
								<LinkTo organization={org.parentOrg} />
							</Form.Field>
						}

						{org.childrenOrgs && org.childrenOrgs.length > 0 && <Form.Field id="childrenOrgs" label="Sub-Orgs">
							<ListGroup>
								{org.childrenOrgs.map(org =>
									<ListGroupItem key={org.id} ><LinkTo organization={org} /></ListGroupItem>
								)}
							</ListGroup>
						</Form.Field>}
					</fieldset>

					<h3>Personnel Laydown</h3>
					<fieldset>
						<legend>Positions needing attention</legend>
						{this.renderPositionTable(positionsNeedingAttention)}
					</fieldset>

					<fieldset>
						<legend>Supported laydown</legend>
						{this.renderPositionTable(supportedPositions)}
					</fieldset>
				</Form>
			</div>
		)
	}

	renderPositionTable(positions) {
		let posCodeHeader, posNameHeader, otherCodeHeader, otherNameHeader
		if (this.state.organization.type === 'ADVISOR_ORG') {
			posCodeHeader = 'CE Billet'
			posNameHeader = 'Advisor'
			otherCodeHeader = 'TASHKIL'
			otherNameHeader = 'Afghan'
		} else {
			otherCodeHeader = 'CE Billet'
			otherNameHeader = 'Advisor'
			posCodeHeader = 'TASHKIL'
			posNameHeader = 'Afghan'
		}
		return <Table>
			<thead>
				<tr>
					<th>{posCodeHeader}</th>
					<th>{posNameHeader}</th>
					<th>{otherCodeHeader}</th>
					<th>{otherNameHeader}</th>
				</tr>
			</thead>
			<tbody>
				{Position.map(positions, position =>
					position.associatedPositions.length ?
						Position.map(position.associatedPositions, (other, idx) =>
							this.renderPositionRow(position, other, idx)
						)
						:
						this.renderPositionRow(position, null, 0)
				)}
			</tbody>
		</Table>
	}

	renderPositionRow(position, other, otherIndex) {
		let key = position.id
		let otherCodeCol, otherNameCol, positionCodeCol, positionNameCol
		if (other) {
			key += '.' + other.id
			otherCodeCol = <td><LinkTo position={other} /></td>

			otherNameCol = other.person
				? <td><LinkTo person={other.person} /></td>
				: <td className="text-danger">Unfilled</td>
		}

		if (otherIndex === 0) {
			positionCodeCol = <td><LinkTo position={position} /></td>
			positionNameCol = (position.person)
					? <td><LinkTo person={position.person} /></td>
					: <td className="text-danger">Unfilled</td>
		}

		otherCodeCol = otherCodeCol || <td></td>
		otherNameCol = otherNameCol || <td></td>
		positionCodeCol = positionCodeCol || <td></td>
		positionNameCol = positionNameCol || <td></td>



		return <tr key={key}>
			{positionCodeCol}
			{positionNameCol}
			{otherCodeCol}
			{otherNameCol}
		</tr>
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === 'createPos') {
			History.push({pathname: 'positions/new', query: {organizationId: this.state.organization.id}})
		} else if (eventKey === 'createSub') {
			History.push({pathname: 'organizations/new', query: {parentOrgId: this.state.organization.id}})
		} else if (eventKey === 'edit') {
			History.push(Organization.pathForEdit(this.organization))
		} else if (eventKey === 'createPoam') {
			History.push({pathname: 'poams/new', query: {responsibleOrg: this.state.organization.id}})
		} else {
			console.log('Unimplemented Action: ' + eventKey)
		}
	}
}
