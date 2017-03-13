import React, {Component} from 'react'
import {Table} from 'react-bootstrap'

import LinkTo from 'components/LinkTo'

export default class OrganizationApprovals extends Component {
	render() {
		let org = this.props.organization
		let approvalSteps = org.approvalSteps

		return <div>
			<h2 className="legend">Approval process</h2>
			<fieldset>
				{approvalSteps && approvalSteps.map((step, idx) =>
					<div key={'step_' + idx}>
						<fieldset>
							<h4 className="form-header" id={`approvalStep_${idx}_name`}>Step {idx + 1}: {step.name}</h4>
							<Table>
								<thead>
									<tr>
										<th>Name</th>
										<th>Position</th>
									</tr>
								</thead>

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
			</fieldset>
		</div>
	}
}
