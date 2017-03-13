import React, {PropTypes} from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import {Link} from 'react-router'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'

import OrganizationPoams from 'pages/organizations/Poams'
import OrganizationLaydown from 'pages/organizations/Laydown'
import OrganizationApprovals from 'pages/organizations/Approvals'

import API from 'api'
import {Organization} from 'models'

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
				poams { id, shortName, longName },
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

		let currentUser = this.context.app.state.currentUser
		let isSuperUser = (currentUser) ? currentUser.isSuperUserForOrg(org) : false
		let isAdmin = (currentUser) ? currentUser.isAdmin() : false

		let superUsers = org.positions.filter(pos => pos.type === 'SUPER_USER')

		return (
			<div>
				<Breadcrumbs items={[[org.shortName || 'Organization', Organization.pathFor(org)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				<Form static formFor={org} horizontal>
					<fieldset>
						<legend>
							{org.shortName}

							<small>
								{isAdmin && <Link className="btn btn-default btn-sm" to={{pathname: Organization.pathForNew(), query: {parentOrgId: org.id}}}>
									Create sub-organization
								</Link>}

								{isSuperUser && <Link className="btn btn-primary btn-sm" to={Organization.pathForEdit(org)}>
									Edit
								</Link>}
							</small>
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

					<OrganizationPoams organization={org} />
					<OrganizationLaydown organization={org} />
					<OrganizationApprovals organization={org} />

					<fieldset>
						<legend>Reports from {org.shortName}</legend>
						<ReportCollection organization={org} />
					</fieldset>
				</Form>
			</div>
		)
	}
}

export default ModelPage(OrganizationShow)
