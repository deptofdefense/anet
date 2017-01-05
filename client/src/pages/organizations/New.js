import React from 'react'
import autobind from 'autobind-decorator'


import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Autocomplete from 'components/Autocomplete'

import API from 'api'
import {Organization} from 'models'

export default class OrganizationNew extends React.Component {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
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

	render() {
		let org = this.state.org

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Organization</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Organization', '/organizations/new']]} />

				<Form formFor={org} onChange={this.onChange} onSubmit={this.onSubmit} horizontal actionText="Create Organization">
					{this.state.error && <fieldset><p>There was a problem saving this Organization</p><p>{this.state.error}</p></fieldset>}

					<fieldset>
						<legend>Create a new Organization</legend>
						<Form.Field id="type" componentClass="select">
							<option value="ADVISOR_ORG">Advisor Organization</option>
							<option value="PRINCIPAL_ORG">Afghan Govt Organization</option>
						</Form.Field>
						<Form.Field id="parentOrg" label="Parent Org" >
							<Autocomplete valueKey="name" placeholder="Choose the parent organization" url="/api/organizations/search" />
						</Form.Field>

						<Form.Field id="name" />
					</fieldset>

					{ org.type === "ADVISOR_ORG" && 
						this.renderPoams()
					}

					{ org.type === "ADVISOR_ORG" &&
						this.renderApprovalSteps()
					}
				</Form>
			</div>
		)
	}

	renderPoams() { 
		return <fieldset className="todo">
			<legend>Plan of Action and Milestones / Pillars</legend>
		</fieldset>
	}

	renderApprovalSteps() { 
		return <fieldset className="todo">
			<legend>Approval Process</legend>
		</fieldset>
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

		API.send('/api/organizations/new', this.state.org, {disableSubmits: true})
			.then(org => {
				if (org.code) throw org.code
				History.push(Organization.pathFor(org))
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
