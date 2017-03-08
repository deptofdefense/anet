import React from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'

import OrganizationForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'

import API from 'api'
import {Organization} from 'models'

class OrganizationEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	static modelName = 'Organization'

	constructor(props) {
		super(props)

		this.state = {
			organization: new Organization(),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			organization(id:${props.params.id}) {
				id, shortName, longName, type,
				parentOrg { id, shortName, longName }
				approvalSteps { id, name
					approvers { id, name, person { id, name}}
				},
				poams { id, shortName, longName}
			}
		`).then(data => {
			this.setState({organization: new Organization(data.organization)})
		})
	}

	render() {
		let organization = this.state.organization

		return (
			<div>
				<ContentForHeader>
					<h2>Edit {organization.shortName}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[[`Edit ${organization.shortName}`, Organization.pathForEdit(organization)]]} />
				<Messages error={this.state.error} success={this.state.success} />

				<OrganizationForm organization={organization} edit />
			</div>
		)
	}
}

export default ModelPage(OrganizationEdit)
