import React, {Component} from 'react'
import {Table} from 'react-bootstrap'

import Fieldset from 'components/Fieldset'
import LinkTo from 'components/LinkTo'

export default class OrganizationApprovals extends Component {
	render() {
		let org = this.props.organization
		let approvalSteps = org.approvalSteps

		return <Fieldset id="approvals" title="Approval process">
			{approvalSteps && approvalSteps.map((step, idx) =>
				<div key={'step_' + idx}>
					<Fieldset title={`Step ${idx + 1}: ${step.name}`}>
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
					</Fieldset>
				</div>
			)}
		</Fieldset>
	}
}
