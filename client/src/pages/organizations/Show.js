import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Breadcrumbs from 'components/Breadcrumbs'
import Fieldset from 'components/Fieldset'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import Messages, {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'

import GuidedTour from 'components/GuidedTour'
import {orgTour} from 'pages/HopscotchTour'

import OrganizationPoams from './Poams'
import OrganizationLaydown from './Laydown'
import OrganizationApprovals from './Approvals'

import {Organization} from 'models'
import GQL from 'graphql'

export default class OrganizationShow extends Page {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	static modelName = 'Organization'

	constructor(props) {
		super(props)

		this.state = {
			organization: new Organization({id: props.params.id}),
			reports: null,
			action: props.params.action
		}

		this.reportsPageNum = 0
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

	getReportQueryPart(orgId) {
		let reportQuery = {
			pageNum: this.reportsPageNum,
			pageSize: 10,
			orgId: orgId
		}
		let reportsPart = new GQL.Part(/* GraphQL */`
			reports: reportList(query:$reportQuery) {
				pageNum, pageSize, totalCount, list {
					id, intent, engagementDate, keyOutcomes, nextSteps, state, cancelledReason
					author { id, name },
					primaryAdvisor { id, name } ,
					primaryPrincipal {id, name },
					advisorOrg { id, shortName, longName }
					principalOrg { id, shortName, longName }
					location { id, name, lat, lng }
				}
			}`)
			.addVariable("reportQuery", "ReportSearchQuery", reportQuery)
		return reportsPart
	}

	fetchData(props) {
		let orgPart = new GQL.Part(/* GraphQL */`
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
				approvalSteps {
					id, name, approvers { id, name, person { id, name}}
				}
			}`)
		let reportsPart = this.getReportQueryPart(props.params.id)

		GQL.run([orgPart, reportsPart]).then(data =>
			this.setState({
				organization: new Organization(data.organization),
				reports: data.reports
			})
		)
	}

	render() {
		let org = this.state.organization
		let reports = this.state.reports

		let currentUser = this.context.currentUser
		let isSuperUser = currentUser && currentUser.isSuperUserForOrg(org)
		let isAdmin = currentUser && currentUser.isAdmin()

		let superUsers = org.positions.filter(pos => pos.status !== 'INACTIVE' && (!pos.person || pos.person.status !== 'INACTIVE') && (pos.type === 'SUPER_USER' || pos.type === 'ADMINISTRATOR'))

		return (
			<div>
				{currentUser.isSuperUser() && <div className="pull-right">
					<GuidedTour
						tour={orgTour}
						autostart={localStorage.newUser === 'true' && localStorage.hasSeenOrgTour !== 'true'}
						onEnd={() => localStorage.hasSeenOrgTour = 'true'}
					/>
				</div>}

				<Breadcrumbs items={[[org.shortName || 'Organization', Organization.pathFor(org)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				<Form formFor={org} static horizontal>
					<Fieldset id="info" title={org.shortName} action={<div>
						{isAdmin && <LinkTo organization={Organization.pathForNew({parentOrgId: org.id})} button>
							Create sub-organization
						</LinkTo>}

						{isSuperUser && <LinkTo organization={org} edit button="primary" id="editButton">
							Edit
						</LinkTo>}
					</div>}>

						<Form.Field id="type">
							{org.humanNameOfType()}
						</Form.Field>

						<Form.Field id="longName" label="Description"/>

						{org.parentOrg && org.parentOrg.id &&
							<Form.Field id="parentOrg" label="Parent organization">
								<LinkTo organization={org.parentOrg} >{org.parentOrg.shortName} {org.parentOrg.longName}</LinkTo>
							</Form.Field>
						}

						{org.isAdvisorOrg() &&
							<Form.Field id="superUsers" label="Super users">
								{superUsers.map(position =>
									<p key={position.id}>
										{position.person ?
											<LinkTo person={position.person} />
											:
											<i><LinkTo position={position} />- (Unfilled)</i>
										}
									</p>
								)}
								{superUsers.length === 0 && <p><i>No super users</i></p>}
							</Form.Field>
						}

						{org.childrenOrgs && org.childrenOrgs.length > 0 && <Form.Field id="childrenOrgs" label="Sub organizations">
							<ListGroup>
								{org.childrenOrgs.map(org =>
									<ListGroupItem key={org.id} >
										<LinkTo organization={org} >{org.shortName} {org.longName}</LinkTo>
									</ListGroupItem>
								)}
							</ListGroup>
						</Form.Field>}
					</Fieldset>

					<OrganizationLaydown organization={org} />
					<OrganizationApprovals organization={org} />
					<OrganizationPoams organization={org} />

					<Fieldset id="reports" title={`Reports from ${org.shortName}`}>
						<ReportCollection
							paginatedReports={reports}
							goToPage={this.goToReportsPage}
						/>
					</Fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	goToReportsPage(pageNum) {
		this.reportsPageNum = pageNum
		let reportQueryPart = this.getReportQueryPart(this.state.organization.id)
		GQL.run([reportQueryPart]).then(data =>
			this.setState({reports: data.reports})
		)
	}


}
