import React, {PropTypes, Component} from 'react'
import {Table} from 'react-bootstrap'

import LinkTo from 'components/LinkTo'
import ScrollableFieldset from 'components/ScrollableFieldset'

import {Poam} from 'models'

export default class OrganizationPoams extends Component {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	render() {
		let org = this.props.organization

		if (org.type !== 'ADVISOR_ORG') {
			return <div></div>
		}

		return <ScrollableFieldset title="PoAMs / Pillars" height={500} >
			<Table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{Poam.map(org.poams, poam =>
						<tr key={poam.id}>
							<td><LinkTo poam={poam} >{poam.shortName}</LinkTo></td>
							<td>{poam.longName}</td>
						</tr>
					)}
				</tbody>
			</Table>
		</ScrollableFieldset>
	}

}
