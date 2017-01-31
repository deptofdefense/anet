import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Grid, Row, Col, Table, ListGroup, ListGroupItem, DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import History from 'components/History'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'
import ScrollableFieldset from 'components/ScrollableFieldset'
import CollapsableFieldset, {CollapsedContent, ExpandedContent} from 'components/CollapsableFieldset'

import API from 'api'
import {Organization, Position, Poam} from 'models'

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
					id, name, approvers { id, name, person { id, name}}
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
			poamsContent = <ScrollableFieldset title="PoAMs / Pillars" height={500} >
				{this.renderPoamsTable(org.poams)}
			</ScrollableFieldset>
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

					<CollapsableFieldset title="Personnel Laydown">
						<ExpandedContent>
							<fieldset>
								<legend>Positions needing attention</legend>
								{this.renderPositionTable(positionsNeedingAttention)}
							</fieldset>

							<fieldset>
								<legend>Supported laydown</legend>
								{this.renderPositionTable(supportedPositions)}
							</fieldset>
						</ExpandedContent>
						<CollapsedContent>
							<Grid>
								<Row>
									<Col md={3}>
										<b>Vacancy or Requires Action</b>
									</Col>
									<Col md={4}>
										{positionsNeedingAttention.length} positions
									</Col>
								</Row>
								<Row>
									<Col md={3}>
										<b>Supported Laydown</b>
									</Col>
									<Col md={4}>
										{supportedPositions.length} positions
									</Col>
								</Row>
							</Grid>
						</CollapsedContent>
					</CollapsableFieldset>

					{this.renderApprovalProcess()}

					<ScrollableFieldset title="Recent Reports" height={500} >
						<ReportCollection reports={org.reports} />
					</ScrollableFieldset>
				</Form>
			</div>
		)
	}

	renderPositionTable(positions) {
		let posCodeHeader, posNameHeader, otherCodeHeader, otherNameHeader
		if (this.state.organization.type === "ADVISOR_ORG") {
			posCodeHeader = "CE Billet"
			posNameHeader = "Advisor"
			otherCodeHeader = "TASHKIL"
			otherNameHeader = "Afghan"
		} else {
			otherCodeHeader = "CE Billet"
			otherNameHeader = "Advisor"
			posCodeHeader = "TASHKIL"
			posNameHeader = "Afghan"
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
						<td><LinkTo poam={poam} >{poam.shortName}</LinkTo></td>
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

	@autobind
	renderApprovalProcess() {
		let org = this.state.organization
		let approvalSteps = org.approvalSteps
		return <CollapsableFieldset title="Approval Process">
			<ExpandedContent>
				{approvalSteps && approvalSteps.map((step, idx) =>
					<fieldset key={"step_" + idx}>
						<legend>Step {idx + 1}: {step.name}</legend>
						<Table>
							<thead><tr><th>Name</th><th>Position</th></tr></thead>
							<tbody>
								{step.approvers.map(position =>
									<tr key={position.id}>
										<td>{position.person && <LinkTo person={position.person} />}</td>
										<td><LinkTo position={position} /></td>
									</tr>
								)}
							</tbody>
						</Table>
					</fieldset>
				)}
			</ExpandedContent>
			<CollapsedContent>
				<Grid>
				{approvalSteps && approvalSteps.map((step, idx) =>
					<Row key={idx}>
						<Col md={3}>
							<b>Step #{idx + 1}: {step.name}</b>
						</Col>
						<Col md={4}>
							{step.approvers.length} people
						</Col>
					</Row>
				)}
				</Grid>
			</CollapsedContent>
		</CollapsableFieldset>
	}
}
