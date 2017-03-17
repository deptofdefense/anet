import React, {Component, PropTypes} from 'react'
import {Table} from 'react-bootstrap'

import Fieldset from 'components/Fieldset'
import LinkTo from 'components/LinkTo'

import {Poam} from 'models'

export default class OrganizationPoams extends Component {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	render() {
		let currentUser = this.context.currentUser

		let org = this.props.organization
		if (!org.isAdvisorOrg()) {
			return <div></div>
		}

		let poams = org.poams
		let isSuperUser = currentUser && currentUser.isSuperUserForOrg(org)

		return <Fieldset id="poams" title="PoAMs / Pillars" action={
			isSuperUser && <LinkTo poam={Poam.pathForNew({responsibleOrgId: org.id})} button>Create PoAM</LinkTo>
		}>
			<Table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
				</thead>

				<tbody>
					{Poam.map(poams, (poam, idx) =>
						<tr key={poam.id} id={`poam_${idx}`} >
							<td><LinkTo poam={poam} >{poam.shortName}</LinkTo></td>
							<td>{poam.longName}</td>
						</tr>
					)}
				</tbody>
			</Table>

			{poams.length === 0 && <em>This organization doesn't have any PoAMs</em>}
		</Fieldset>
	}
}
