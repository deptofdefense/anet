import React from 'react'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import Page from 'components/Page'
import OrganizationForm from 'components/OrganizationForm'

import API from 'api'
import {Organization} from 'models'

export default class OrganizationEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			organization: new Organization(),
		}
	}

	fetchData(props) {
		API.query(/*GraphQL*/ `
			organization(id:${props.params.id}) {
				id, shortName, longName, type,
				parentOrg { id, shortName, longName }
				approvalSteps { id,
					approverGroup { id, name,
						members { id, name}
					}
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

				<Breadcrumbs items={[[`Edit ${organization.shortName}`, `/organizations/${organization.id}/edit`]]} />
				<OrganizationForm
					organization={organization}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					actionText="Save Organization"
					edit
					error={this.state.error}/>
			</div>
		)
	}

	@autobind
	onChange() {
		let organization = this.state.organization
		this.setState({organization})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let org = Object.without(this.state.organization, 'childrenOrgs', 'positions')

		API.send('/api/organizations/update', org, {disableSubmits: true})
			.then(response => {
				if (response.code) throw response.code
				History.push(Organization.pathFor(this.state.organization))
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
