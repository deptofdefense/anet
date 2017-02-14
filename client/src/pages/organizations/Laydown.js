import React, {PropTypes, Component} from 'react'
import {Table} from 'react-bootstrap'
import LinkTo from 'components/LinkTo'

import {Position} from 'models'

export default class OrganizationLaydown extends Component {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	static propTypes = {
		organization: PropTypes.object.isRequired
	}

	render() {
		let org = this.props.organization

		let positionsNeedingAttention = org.positions.filter(position => !position.person )
		let supportedPositions = org.positions.filter(position => positionsNeedingAttention.indexOf(position) === -1)

		return (
			<div>
			<h3>Personnel Laydown</h3>
			<fieldset>
				<legend>Positions needing attention</legend>
				{this.renderPositionTable(positionsNeedingAttention)}
			</fieldset>

			<fieldset>
				<legend>Supported laydown</legend>
				{this.renderPositionTable(supportedPositions)}
			</fieldset>
		</div>
		)
	}

	renderPositionTable(positions) {
		let org = this.props.organization
		let posCodeHeader, posNameHeader, otherCodeHeader, otherNameHeader
		if (org.type === "ADVISOR_ORG") {
			posCodeHeader = "CE Billet"
			posNameHeader = "Advisor"
			otherCodeHeader = "TASHKIL"
			otherNameHeader = "Afghan"
		} else {
			otherCodeHeader = 'CE Billet'
			otherNameHeader = 'Advisor'
			posCodeHeader = 'TASHKIL'
			posNameHeader = 'Afghan'
		}
		return <Table>
			<thead>
				<tr>
					<th>{posCodeHeader}</th>
					<th>{posNameHeader}</th>
					<th>{otherCodeHeader}</th>
					<th>{otherNameHeader}</th>
				</tr>
			</thead>
			<tbody>
				{Position.map(positions, position =>
					position.associatedPositions.length ?
						Position.map(position.associatedPositions, (other, idx) =>
							this.renderPositionRow(position, other, idx)
						)
						:
						this.renderPositionRow(position, null, 0)
				)}
			</tbody>
		</Table>
	}

	renderPositionRow(position, other, otherIndex) {
		let key = position.id
		let otherCodeCol, otherNameCol, positionCodeCol, positionNameCol
		if (other) {
			key += '.' + other.id
			otherCodeCol = <td><LinkTo position={other} /></td>

			otherNameCol = other.person
				? <td><LinkTo person={other.person} /></td>
				: <td className="text-danger">Unfilled</td>
		}

		if (otherIndex === 0) {
			positionCodeCol = <td><LinkTo position={position} /></td>
			positionNameCol = (position.person)
					? <td><LinkTo person={position.person} /></td>
					: <td className="text-danger">Unfilled</td>
		}

		otherCodeCol = otherCodeCol || <td></td>
		otherNameCol = otherNameCol || <td></td>
		positionCodeCol = positionCodeCol || <td></td>
		positionNameCol = positionNameCol || <td></td>



		return <tr key={key}>
			{positionCodeCol}
			{positionNameCol}
			{otherCodeCol}
			{otherNameCol}
		</tr>
	}
}
