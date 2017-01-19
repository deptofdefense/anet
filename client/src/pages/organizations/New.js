import React, {PropTypes} from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import OrganizationForm from 'components/OrganizationForm'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'

import API from 'api'
import {Organization} from 'models'

export default class OrganizationNew extends Page {
	static contextTypes = {
		router: PropTypes.object.isRequired
	}

	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			org: new Organization({ type: "ADVISOR_ORG"}),
		}
	}

	fetchData(props) {
		if (props.location.query.parentOrgId) {
			API.query(/*GraphQL */ `
				organization(id: ${props.location.query.parentOrgId}) {
					id, shortName, longName, type
				}
			`).then(data => {
				let org = this.state.org;
				org.parentOrg = new Organization(data.organization)
				org.type = org.parentOrg.type
				this.setState({org})
			})
		}
	}


	render() {
		let org = this.state.org

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Organization</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Organization', '/organizations/new']]} />

				<OrganizationForm organization={org} onChange={this.onChange}
						onSubmit={this.onSubmit} submitText="Create Organization" />
			</div>
		)
	}



	@autobind
	onChange() {
		let org = this.state.org
		this.setState({org})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let organization = Object.without(this.state.org, 'childrenOrgs', 'positions')
		if (organization.parentOrg) {
			organization.parentOrg = {id: organization.parentOrg.id}
		}

		API.send('/api/organizations/new', organization, {disableSubmits: true})
			.then(org => {
				if (org.code) throw org.code
				History.push({pathname:Organization.pathFor(org),query:{},state:{success:"Created Organization"}})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
