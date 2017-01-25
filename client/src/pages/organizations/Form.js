import React, {Component, PropTypes} from 'react'
import {Button, Table, Radio} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import RadioGroup from 'components/RadioGroup'
import Autocomplete from 'components/Autocomplete'
import PoamsSelector from 'components/PoamsSelector'
import History from 'components/History'

import API from 'api'
import Organization from 'models/Organization'

export default class OrganizationForm extends Component {
	static propTypes = {
		organization: PropTypes.object,
		edit: PropTypes.bool,
	}

	render() {
		let {organization, edit} = this.props
		let {approvalSteps} = organization

		return <Form formFor={organization}
			onChange={this.onChange}
			onSubmit={this.onSubmit}
			submitText="Save organization"
				   horizontal>

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

			{organization.type === "ADVISOR_ORG" && <div>
				<PoamsSelector poams={organization.poams} onChange={this.onChange} />

				<fieldset>
					<legend>Approval Process</legend>

					<Button className="pull-right" onClick={this.addApprovalStep}>
						Add an Approval Step
					</Button>

					{approvalSteps && approvalSteps.map((step, index) =>
						this.renderApprovalStep(step, index)
					)}
				</fieldset>
			</div>}
		</Form>
	}

	renderApprovalStep(step, index) {
		let group = step.approverGroup
		let members = group.members

		return <fieldset key={index}>
			<legend>Step {index + 1}</legend>

			<Form.Field id="approverGroupName"
				value={group.name}
				onChange={this.setStepName.bind(this, index)} />

			<Form.Field id="addApprover" label="Add an Approver" value={members} >
				<Autocomplete valueKey="name"
					placeholder="Choose a person"
					url="/api/people/search"
					queryParams={{role: "ADVISOR"}}
					onChange={this.addApprover.bind(this, index)}
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
								<td onClick={this.removeApprover.bind(this, member, index)}>
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
		let approverIndex = approvers.findIndex(m => m.id === approver.id );

		if (index !== -1) {
			approvers.splice(approverIndex, 1);
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

	@autobind
	onChange() {
		this.forceUpdate()
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let organization = Object.without(this.props.organization, 'childrenOrgs', 'positions')
		if (organization.parentOrg) {
			organization.parentOrg = {id: organization.parentOrg.id}
		}

		let url = `/api/organizations/${this.props.edit ? 'update' : 'new'}`
		API.send(url, organization, {disableSubmits: true})
			.then(response => {
				if (response.code) {
					throw response.code
				}

				if (response.id) {
					organization.id = response.id
				}

				History.replace(Organization.pathForEdit(organization), false)
				History.push(Organization.pathFor(organization), {success: "Organization saved successfully"})
				window.scrollTo(0, 0)
			}).catch(error => {
				this.setState({error})
				window.scrollTo(0, 0)
			})
	}
}
