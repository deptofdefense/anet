import React, {Component, PropTypes} from 'react'
import {Button, Table} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import NavigationWarning from 'components/NavigationWarning'

import Form from 'components/Form'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import Autocomplete from 'components/Autocomplete'
import PoamsSelector from 'components/PoamsSelector'
import History from 'components/History'
import {Position} from 'models'
import Messages from 'components/Messages'

import API from 'api'
import Organization from 'models/Organization'

export default class OrganizationForm extends Component {
	static propTypes = {
		organization: PropTypes.object,
		edit: PropTypes.bool,
	}

	constructor(props) {
		super(props)
		this.state = {
			error: null,
		}
	}

	render() {
		let {organization, edit} = this.props
		let {approvalSteps} = organization

		return <Form formFor={organization}
			onChange={this.onChange}
			onSubmit={this.onSubmit}
			submitText="Save organization"
				   horizontal>

			<Messages error={this.state.error} />
			<fieldset>
				<legend>{edit ? 'Editing ' + organization.shortName : 'Create a new Organization'}</legend>

				<Form.Field id="type">
					<ButtonToggleGroup>
						<Button id="advisorOrgButton" value="ADVISOR_ORG">Advisor Organization</Button>
						<Button id="principalOrgButton" value="PRINCIPAL_ORG">Afghan Govt Organization</Button>
					</ButtonToggleGroup>
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

			{organization.type === 'ADVISOR_ORG' && <div>
				<PoamsSelector poams={organization.poams} onChange={this.onChange} />

				<fieldset>
					<legend>Approval Process</legend>

					<Button className="pull-right" onClick={this.addApprovalStep} bsStyle="primary" id="addApprovalStepButton" >
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
		let approvers = step.approvers

		return <fieldset key={index}>
			<legend>Step {index + 1}</legend>
			<Button className="pull-right" onClick={this.removeApprovalStep.bind(this, index)}>
				X
			</Button>

			<Form.Field id="name"
				value={step.name}
				onChange={(event) => this.setStepName(index, event)} />

			<Form.Field id="addApprover" label="Add an Approver" value={approvers}>
				<Autocomplete valueKey="name"
					placeholder="Search for the approvers position"
					objectType={Position}
					fields={'id, name, code, type, person { id, name, rank}'}
					template={pos =>
						<span>{pos.name} - {pos.code} ({(pos.person) ? pos.person.name : <i>empty</i>})</span>
					}
					queryParams={{type: 'ADVISOR', matchPersonName: true}}
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
						{approvers.map((approver, approverIndex) =>
							<tr key={approver.id} id={`step_${index}_approver_${approverIndex}`} >
								<td onClick={this.removeApprover.bind(this, approver, index)}>
									<span style={{cursor: 'pointer'}}>⛔️</span>
								</td>
								<td>{approver.person && approver.person.name}</td>
								<td >{approver.name}</td>
							</tr>
						)}
					</tbody>
				</Table>
			</Form.Field>
		</fieldset>
	}

	@autobind
	addApprover(index, position) {
		if (!position || !position.id) {
			return
		}

		let org = this.props.organization
		let step = org.approvalSteps[index]
		let newApprovers = step.approvers.slice()
		newApprovers.push(position)
		step.approvers = newApprovers

		this.onChange()
	}

	@autobind
	removeApprover(approver, index) {
		let step = this.props.organization.approvalSteps[index]
		let approvers = step.approvers
		let approverIndex = approvers.findIndex(m => m.id === approver.id )

		if (approverIndex !== -1) {
			approvers.splice(approverIndex, 1)
			this.onChange()
		}
	}

	@autobind
	setStepName(index, event) {
		let name = event && event.target ? event.target.value : event
		let step = this.props.organization.approvalSteps[index]
		step.name = name

		this.onChange()
	}

	@autobind
	addApprovalStep() {
		let org = this.props.organization
		let approvalSteps = org.approvalSteps || []
		approvalSteps.push({name: '', approvers: []})

		this.onChange()
	}

	@autobind
	removeApprovalStep(index) {
		let steps = this.props.organization.approvalSteps
		steps.splice(index, 1)
		this.onChange()
	}

	@autobind
	onChange() {
		this.forceUpdate()
	}

	@autobind
	onSubmit(event) {
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
				History.push(Organization.pathFor(organization), {
					success: 'Organization saved successfully', 
					skipPageLeaveWarning: true
				})
			}).catch(error => {
				this.setState({error})
				window.scrollTo(0, 0)
			})
	}
}
