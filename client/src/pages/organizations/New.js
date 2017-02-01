import React, {PropTypes} from 'react'
import Page from 'components/Page'

import OrganizationForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'

import API from 'api'
import {Organization} from 'models'

export default class OrganizationNew extends Page {
	static contextTypes = {
		router: PropTypes.object.isRequired,
	}

	static pageProps = {
		useNavigation: false,
	}

	constructor(props) {
		super(props)

		this.state = {
			organization: new Organization({type: "ADVISOR_ORG"}),
		}
	}

	fetchData(props) {
		if (props.location.query.parentOrgId) {
			API.query(/* GraphQL */`
				organization(id: ${props.location.query.parentOrgId}) {
					id, shortName, longName, type
				}
			`).then(data => {
				let organization = this.state.organization
				organization.parentOrg = new Organization(data.organization)
				organization.type = organization.parentOrg.type
				this.setState({organization})
			})
		}
	}


	render() {
		let organization = this.state.organization

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Organization</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Organization', Organization.pathForNew()]]} />

				<OrganizationForm organization={organization} />
			</div>
		)
	}
}
