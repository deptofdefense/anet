import React, {PropTypes} from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'
import {ListGroup, ListGroupItem, DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import History from 'components/History'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'

import OrganizationPoams from 'pages/organizations/Poams'
import OrganizationLaydown from 'pages/organizations/Laydown'
import OrganizationApprovals from 'pages/organizations/Approvals'

import API from 'api'
import {Organization, Position, Poam} from 'models'

const ACTION_COMPONENTS = {
	poams: OrganizationPoams,
	approvals: OrganizationApprovals,
	reports: ReportCollection,
	laydown: OrganizationLaydown,
}

class OrganizationShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	static modelName = 'Organization'

	constructor(props) {
		super(props)

		this.state = {
			organization: new Organization({id: props.params.id}),
			action: props.params.action
		}

		setMessages(props,this.state)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.params.action !== this.state.action) {
			this.setState({action: nextProps.params.action})
		}
		if (+nextProps.params.id !== this.state.organization.id) {
			this.loadData(nextProps)
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			organization(id:${props.params.id}) {
				id, shortName, longName, type
				parentOrg { id, shortName, longName }
				childrenOrgs { id, shortName, longName },
				positions {
					id, name, code, status, type,
					person { id, name, status, rank }
					associatedPositions {
						id, name, code, status
						person { id, name, status, rank}
					}
				},
				reports(pageNum:0, pageSize:25) {
					list {
						id, intent, engagementDate, keyOutcomes, nextSteps
						author { id, name },
						primaryAdvisor { id, name } ,
						primaryPrincipal {id, name },
						advisorOrg { id, shortName, longName }
						principalOrg { id, shortName, longName }
						location { id, name, lat, lng }
					}
				},
				approvalSteps {
					id, name, approvers { id, name, person { id, name}}
				},
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization
		let action = this.state.action || 'poams'

		let currentUser = this.context.app.state.currentUser
		let isSuperUser = (currentUser) ? currentUser.isSuperUserForOrg(org) : false
		let isAdmin = (currentUser) ? currentUser.isAdmin() : false
		let showActions = isAdmin || isSuperUser

		let superUsers = org.positions.filter(pos => pos.type === 'SUPER_USER')

		let ActionComponent = ACTION_COMPONENTS[action]

		return (
			<div>
				<Breadcrumbs items={[[org.shortName || 'Organization', Organization.pathFor(org)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				{showActions &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							{isSuperUser && <MenuItem eventKey="edit">Edit Organization</MenuItem>}
							{isAdmin && <MenuItem eventKey="createSub">Create Sub-Organization</MenuItem>}
							{isAdmin && <MenuItem eventKey="createPoam">Create PoAM</MenuItem>}
							{isSuperUser && <MenuItem eventKey="createPos">Create new Position</MenuItem>}
						</DropdownButton>
					</div>
				}

				<h2 className="form-header">{org.shortName}</h2>
				<Form static formFor={org} horizontal>
					<fieldset>
						<Form.Field id="longName" label="Description"/>

						<Form.Field id="type">
							{org.type && org.type.split('_')[0]}
						</Form.Field>

						{org.parentOrg && org.parentOrg.id &&
							<Form.Field id="parentOrg" label="Parent">
								<LinkTo organization={org.parentOrg} />
							</Form.Field>
						}

						{org.type === 'ADVISOR_ORG' &&
							<Form.Field id="superUsers" label="Super Users">
								{superUsers.map(position =>
									<p key={position.id}>
										{position.person ?
											<LinkTo person={position.person} />
											:
											<i><LinkTo position={position} />- (Unfilled)</i>
										}
								</p>
								)}
								{superUsers.length === 0 && <p><i>No Super Users!</i></p>}
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

					<ActionComponent organization={org} />
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === 'createPos') {
			History.push({pathname: Position.pathForNew(), query: {organizationId: this.state.organization.id}})
		} else if (eventKey === 'createSub') {
			History.push({pathname: Organization.pathForNew(), query: {parentOrgId: this.state.organization.id}})
		} else if (eventKey === 'edit') {
			History.push(Organization.pathForEdit(this.state.organization))
		} else if (eventKey === 'createPoam') {
			History.push({pathname: Poam.pathForNew(), query: {responsibleOrg: this.state.organization.id}})
		} else {
			console.log('Unimplemented Action: ' + eventKey)
		}
	}
}

export default ModelPage(OrganizationShow)
