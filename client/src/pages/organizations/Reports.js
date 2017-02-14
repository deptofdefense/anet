import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {ListGroup, ListGroupItem, DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import History from 'components/History'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'
import ReportCollection from 'components/ReportCollection'

import API from 'api'
import {Organization} from 'models'

export default class OrganizationReports extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			organization: {
				id: props.params.id,
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
				childrenOrgs { id, shortName, longName },
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization

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

					<fieldset>
						<legend>Recent reports</legend>
						<ReportCollection reports={org.reports} />
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === 'createPos') {
			History.push({pathname: 'positions/new', query: {organizationId: this.state.organization.id}})
		} else if (eventKey === 'createSub') {
			History.push({pathname: 'organizations/new', query: {parentOrgId: this.state.organization.id}})
		} else if (eventKey === 'edit') {
			History.push(Organization.pathForEdit(this.state.organization))
		} else if (eventKey === 'createPoam') {
			History.push({pathname: 'poams/new', query: {responsibleOrg: this.state.organization.id}})
		} else {
			console.log('Unimplemented Action: ' + eventKey)
		}
	}
}
