import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Table, ListGroup, ListGroupItem, DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import autobind from 'autobind-decorator'
import History from 'components/History'
import LinkTo from 'components/LinkTo'
import Messages , {setMessages} from 'components/Messages'
import ScrollableFieldset from 'components/ScrollableFieldset'

import API from 'api'
import {Organization, Poam} from 'models'

export default class OrganizationDetails extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			organization: {
				id: props.params.id,
				poams: [],
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
				childrenOrgs { id, shortName, longName },
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization

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

				</Form>
			</div>
		)
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
}
