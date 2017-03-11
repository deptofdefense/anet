import React, {PropTypes, Component} from 'react'
import {Table} from 'react-bootstrap'

import LinkTo from 'components/LinkTo'

export default class OrganizationApprovals extends Component {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	render() {
		let org = this.props.organization
		let approvalSteps = org.approvalSteps

		return (
			<div>
				<h2>Approval Process</h2>
				{approvalSteps && approvalSteps.map((step, idx) =>
					<div key={'step_' + idx}>
						<h2 className="form-header" id={`approvalStep_${idx}_name`} >Step {idx + 1}: {step.name}</h2>
						<fieldset>
							<Table>
								<thead><tr><th>Name</th><th>Position</th></tr></thead>
								<tbody>
									{step.approvers.map((position, approverIdx) =>
										<tr key={position.id} id={`step_${idx}_approver_${approverIdx}`} >
											<td>{position.person && <LinkTo person={position.person} />}</td>
											<td><LinkTo position={position} /></td>
										</tr>
									)}
								</tbody>
							</Table>
						</fieldset>
					</div>
				)}
			</div>
		)
	}
}
