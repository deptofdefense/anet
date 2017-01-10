import React, {Component} from 'react'

import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'

export default class OrganizationForm extends Component {
	static propTypes = {
		organization: React.PropTypes.object,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		edit: React.PropTypes.bool,
		actionText: React.PropTypes.string,
		error: React.PropTypes.object,
	}

	render() {
		let {organization, onChange, onSubmit, actionText, error, edit} = this.props

		return <Form formFor={organization} onChange={onChange}
			onSubmit={onSubmit} horizontal
			actionText={actionText}>

			{error &&
				<fieldset>
					<p>There was a problem saving this person</p>
					<p>{error}</p>
				</fieldset>}

			<fieldset>
				<legend>{edit ? "Editing " + organization.name : "Create a new Organization"}</legend>
				<Form.Field id="type" componentClass="select">
					<option value="ADVISOR_ORG">Advisor Organization</option>
					<option value="PRINCIPAL_ORG">Afghan Govt Organization</option>
				</Form.Field>

				<Form.Field id="parentOrg" label="Parent Org" >
					<Autocomplete valueKey="name"
							placeholder="Choose the parent organization"
							url="/api/organizations/search"
							urlParams={"&type=" + organization.type} />
				</Form.Field>

				<Form.Field id="name" />
			</fieldset>

			{ organization.type === "ADVISOR_ORG" &&
				this.renderPoams()
			}

			{ organization.type === "ADVISOR_ORG" &&
				this.renderApprovalSteps()
			}
		</Form>
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

}
