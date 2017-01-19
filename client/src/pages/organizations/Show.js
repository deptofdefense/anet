import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Table, ListGroup, ListGroupItem, DropdownButton, MenuItem} from 'react-bootstrap'

import API from 'api'
import {Organization, Position, Poam} from 'models'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import History from 'components/History'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'

export default class OrganizationShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			organization: {
				id: props.params.id,
				positions: [],
				poams: [],
				reports: []
			},
		}
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			organization(id:${props.params.id}) {
				id, shortName, longName, type
				parentOrg { id, shortName, longName }
				poams { id, longName, shortName }
				positions {
					id, name, code
					person { id, name }
					associatedPositions {
						id, name, code
						person { id, name }
					}
				},
				childrenOrgs { id, shortName, longName },
				approvalSteps {
					approverGroup {
						id, name, members { id, name , position { id, name} }
					}
				},
				reports(pageNum:0, pageSize:25) {
					id, intent, engagementDate, keyOutcomesSummary, nextStepsSummary
					author { id, name },
					primaryAdvisor { id, name } ,
					primaryPrincipal {id, name },
					advisorOrg { id, shortName, longName }
					principalOrg { id, shortName, longName }
					location { id, name, lat, lng }
				}
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization

		let positionsNeedingAttention = org.positions.filter(position => !position.person )
		let supportedPositions = org.positions.filter(position => positionsNeedingAttention.indexOf(position) === -1)

		let poamsContent = ''
		if (org.type === 'ADVISOR_ORG') {
			poamsContent = <fieldset>
				<legend>POAMs / Pillars</legend>
				{this.renderPoamsTable(org.poams)}
			</fieldset>
		}

		let currentUser = this.context.app.state.currentUser;
		let isSuperUser = (currentUser) ? currentUser.isSuperUserForOrg(org) : false
		let isAdmin = (currentUser) ? currentUser.isAdmin() : false
		let showActions = isAdmin || isSuperUser;

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

					{poamsContent}

					<fieldset>
						<legend>Recent Reports</legend>
						<ReportCollection reports={org.reports} />
					</fieldset>

					<fieldset>
						<legend>Positions needing attention</legend>
						{this.renderPositionTable(positionsNeedingAttention)}
					</fieldset>

					<fieldset>
						<legend>Supported laydown</legend>
						{this.renderPositionTable(supportedPositions)}
					</fieldset>

					<h2>Approval Process</h2>
					{org.approvalSteps && org.approvalSteps.map((step, idx) =>
						<fieldset key={"step_" + idx}>
							<legend>Step {idx + 1}: {step.approverGroup.name}</legend>
							<Table>
								<thead><tr><th>Name</th><th>Position</th></tr></thead>
								<tbody>
									{step.approverGroup.members.map(person =>
										<tr key={person.id}>
											<td><LinkTo person={person} /></td>
											<td>{person.position && <LinkTo position={person.position} />}</td>
										</tr>
									)}
								</tbody>
							</Table>
						</fieldset>
					)}
				</Form>
			</div>
		)
	}

	renderPositionTable(positions) {
		return <Table>
			<thead>
				<tr>
					<th>NATO billet</th>
					<th>Advisor</th>
					<th>Afghan billet</th>
					<th>Afghan</th>
				</tr>
			</thead>
			<tbody>
				{Position.map(positions, position =>
					position.associatedPositions.length
					? Position.map(position.associatedPositions, other => this.renderPositionRow(position, other))
					: this.renderPositionRow(position)
				)}
			</tbody>
		</Table>
	}

	renderPositionRow(position, other) {
		let key = position.id
		let otherCodeCol, otherNameCol
		if (other) {
			key += '.' + other.id
			otherCodeCol = <td><LinkTo position={other} /></td>

			otherNameCol = other.person
				? <td><LinkTo person={other.person} /></td>
				: <td className="text-danger">Unfilled</td>
		}

		otherCodeCol = otherCodeCol || <td></td>
		otherNameCol = otherNameCol || <td></td>

		return <tr key={key}>
			<td><LinkTo position={position} /></td>

			{position.person
				? <td><LinkTo person={position.person} /></td>
				: <td className="text-danger">Unfilled</td>
			}

			{otherCodeCol}
			{otherNameCol}
		</tr>
	}

	renderPoamsTable(poams) {
		return <Table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{Poam.map(poams, poam =>
					<tr key={poam.id}>
						<td><LinkTo poam={poam} /></td>
						<td>{poam.longName}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "createPos") {
			History.push("/positions/new?organizationId=" + this.state.organization.id)
		} else if (eventKey === "createSub") {
			History.push("/organizations/new?parentOrgId=" + this.state.organization.id)
		} else if (eventKey === "edit") {
			History.push("/organizations/" + this.state.organization.id + "/edit")
		} else if (eventKey === "createPoam") {
			History.push("/poams/new?responsibleOrg=" + this.state.organization.id)
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
	}
}
