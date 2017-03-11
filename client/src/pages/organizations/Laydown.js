import React, {PropTypes, Component} from 'react'
import {Table, Button} from 'react-bootstrap'
import LinkTo from 'components/LinkTo'

import {Position} from 'models'
import autobind from 'autobind-decorator'

export default class OrganizationLaydown extends Component {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	static propTypes = {
		organization: PropTypes.object.isRequired
	}

	constructor(props) {
		super(props)

		this.state = {
			showInactivePositions: false
		}
	}

	render() {
		let org = this.props.organization
		let showInactivePositions = this.state.showInactivePositions
		let numInactivePos = org.positions.filter(p => p.status === 'INACTIVE').length

		let positionsNeedingAttention = org.positions.filter(position => !position.person )
		let supportedPositions = org.positions.filter(position => positionsNeedingAttention.indexOf(position) === -1)

		return (
			<div>
			<h2 className="form-header">
				Positions needing attention
				<div className="pull-right orgLaydownToggleInactive">
					<Button bsStyle="link" onClick={this.toggleShowInactive}>
						{(showInactivePositions ? "Hide " : "Show ") + numInactivePos + " Inactive Position(s)"}
					</Button>
				</div>
			</h2>

			<fieldset>
				{this.renderPositionTable(positionsNeedingAttention)}
			</fieldset>

			<h2 className="form-header" >Supported laydown</h2>
			<fieldset>
				{this.renderPositionTable(supportedPositions)}
			</fieldset>
		</div>
		)
	}

	renderPositionTable(positions) {
		let org = this.props.organization
		let posCodeHeader, posNameHeader, otherCodeHeader, otherNameHeader
		if (org.type === 'ADVISOR_ORG') {
			posCodeHeader = 'CE Billet'
			posNameHeader = 'Advisor'
			otherCodeHeader = 'TASHKIL'
			otherNameHeader = 'Afghan'
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
		if (position.status === 'INACTIVE' && this.state.showInactivePositions === false) {
			return
		}

		if (other) {
			key += '.' + other.id
			otherCodeCol = <td><LinkTo position={other} >{this.positionWithStatus(other)}</LinkTo></td>

			otherNameCol = other.person
				? <td><LinkTo person={other.person} >{this.personWithStatus(other.person)}</LinkTo></td>
				: <td className="text-danger">Unfilled</td>
		}

		if (otherIndex === 0) {
			positionCodeCol = <td><LinkTo position={position} >{this.positionWithStatus(position)}</LinkTo></td>
			positionNameCol = (position.person)
					? <td><LinkTo person={position.person} >{this.personWithStatus(position.person)}</LinkTo></td>
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

	personWithStatus(person) {
		if (person.status === 'INACTIVE') {
			return <i>{person.name + " (Inactive)"}</i>
		} else {
			return person.name
		}
	}

	positionWithStatus(pos) {
		if (pos.status === 'INACTIVE') {
			return <i>{pos.name + " (Inactive)"}</i>
		} else {
			return pos.name
		}
	}

	@autobind
	toggleShowInactive() {
		this.setState({showInactivePositions: !this.state.showInactivePositions})
	}
}
