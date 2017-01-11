import React, {Component} from 'react'

import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import PoamsSelector from 'components/PoamsSelector'

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
				<PoamsSelector poams={organization.poams} onChange={onChange}/>
			}

			{ organization.type === "ADVISOR_ORG" &&
				this.renderApprovalSteps()
			}
		</Form>
	}

	renderApprovalSteps() {
		let approvalSteps = this.props.organization.approvalSteps
		return <fieldset>
			<legend>Approval Process
				<Button className="pull-right" onClick="addApprovalStep">Add an Approval Step</Button>
			</legend>

			{approvalSteps && approvalSteps.map((step, idx) =>
				this.renderApprovalStep(step, idx)
			)}
		</fieldset>
	}

	renderApprovalStep(step, idx) {
		let members = (step.approverGroup && step.approverGroups.members) || []
		return <fieldset key={"step_" + idx}>
			<legend>Step {idx + 1}</legend>
			<Form.field id="approverGroupName" value={step.approverGroup && step.approverGroup.name} />
			<Form.Field id="addApprover" label="Add an Approver">
				<Autocomplete valueKey="name"
					placeholder="Choose a person"
					url="/api/people/search"
					urlParams="&type=ADVISOR"
					onChange={this.addApprover(idx)} />
				<Table striped>
					<thead>
						<tr>
							<th></th>
							<th>Name</th>
							<th>Position</th>
						</tr>
					</thead>
					<tbody>
						{members.map(member =>
							<tr key={member.id}>
								<td onClick={this.removeApprover.bind(this, member, idx)}>
									<span style={{cursor: 'pointer'}}>⛔️</span>
								</td>
								<td>{member.name}</td>
								<td className="todo"></td>
							</tr>
						)}
					</tbody>
				</Table>
			</Form.Field>
		</fieldset>

	}

}
