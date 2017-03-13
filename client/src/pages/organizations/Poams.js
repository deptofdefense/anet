import React, {Component} from 'react'
import {Table} from 'react-bootstrap'
import {Link} from 'react-router'

import LinkTo from 'components/LinkTo'

import {Poam} from 'models'

export default class OrganizationPoams extends Component {
	render() {
		let org = this.props.organization
		if (org.type !== 'ADVISOR_ORG') {
			return <div></div>
		}

		let poams = org.poams

		return <fieldset>
			<legend>
				PoAMs / Pillars
				<small><Link className="btn btn-default btn-sm" to={Poam.pathForNew()}>Create PoAM</Link></small>
			</legend>

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
		</fieldset>
	}
}
