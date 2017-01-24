import React, {Component, PropTypes} from 'react'
import {Button, Table, Radio} from 'react-bootstrap'

import Form from 'components/Form'
import RadioGroup from 'components/RadioGroup'
import Autocomplete from 'components/Autocomplete'
import PoamsSelector from 'components/PoamsSelector'
import autobind from 'autobind-decorator'

export default class OrganizationForm extends Component {
	static propTypes = {
		organization: PropTypes.object,
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		edit: PropTypes.bool,
		submitText: PropTypes.string
	}

	render() {
		let {organization, onChange, onSubmit, submitText, edit} = this.props

		return <Form formFor={organization} onChange={onChange}
			onSubmit={onSubmit} horizontal
			submitText={submitText}>

			<fieldset>
				<legend>{edit ? "Editing " + organization.shortName : "Create a new Organization"}</legend>
				<Form.Field id="type">
					<RadioGroup>
						<Radio value="ADVISOR_ORG">Advisor Organization</Radio>
						<Radio value="PRINCIPAL_ORG">Afghan Govt Organization</Radio>
					</RadioGroup>
				</Form.Field>

				<Form.Field id="parentOrg" label="Parent organization">
					<Autocomplete valueKey="shortName"
						placeholder="Start typing to search for a higher level organization..."
						url="/api/organizations/search"
						queryParams={{type: organization.type}} />
				</Form.Field>

				<Form.Field id="shortName" label="Name" placeholder="e.g. EF1.1" />
				<Form.Field id="longName" label="Description" placeholder="e.g. Force Sustainment" />
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
			<legend>Approval Process</legend>
			<Button className="pull-right" onClick={this.addApprovalStep}>Add an Approval Step</Button>

			{approvalSteps && approvalSteps.map((step, idx) =>
				this.renderApprovalStep(step, idx)
			)}
		</fieldset>
	}

	renderApprovalStep(step, idx) {
		let group = step.approverGroup;
		let members = group.members;
		return <fieldset key={"step_" + idx}>
			<legend>Step {idx + 1}</legend>
			<Form.Field id="approverGroupName"
				value={group.name}
				onChange={this.setStepName.bind(this, idx)}/>
			<Form.Field id="addApprover" label="Add an Approver" value={members} >
				<Autocomplete valueKey="name"
					placeholder="Choose a person"
					url="/api/people/search"
					queryParams={{role: "ADVISOR"}}
					onChange={this.addApprover.bind(this, idx)}
					clearOnSelect={true} />
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

	@autobind
	addApprover(index, person) {
		let org = this.props.organization;
		let step = org.approvalSteps[index];
		let newMembers = step.approverGroup.members.slice();
		newMembers.push(person);
		step.approverGroup.members = newMembers;

		this.props.onChange();
	}

	@autobind
	removeApprover(approver, index) {
		let step = this.props.organization.approvalSteps[index];
		let approvers = step.approverGroup.members;
		let approverIdx = approvers.findIndex(m => m.id === approver.id );

		if (index !== -1) {
			approvers.splice(approverIdx, 1);
			this.props.onChange();
		}
	}

	@autobind
	setStepName(index, event) {
		let name = event && event.target ? event.target.value : event
		let step = this.props.organization.approvalSteps[index];
		step.approverGroup.name = name;

		this.props.onChange();
	}

	@autobind
	addApprovalStep() {
		let org = this.props.organization;
		let approvalSteps = org.approvalSteps || [];
		approvalSteps.push({approverGroup: {name: "", members:[]}});

		this.props.onChange()
	}
}
