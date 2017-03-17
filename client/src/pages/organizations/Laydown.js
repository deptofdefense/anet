import React, {PropTypes, Component} from 'react'
import {Table, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Fieldset from 'components/Fieldset'
import LinkTo from 'components/LinkTo'

import {Position, Person} from 'models'

export default class OrganizationLaydown extends Component {
	static propTypes = {
		organization: PropTypes.object.isRequired
	}

	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			showInactivePositions: false
		}
	}

	render() {
		let currentUser = this.context.currentUser
		let org = this.props.organization
		let isSuperUser = currentUser && currentUser.isSuperUserForOrg(org)

		let showInactivePositions = this.state.showInactivePositions
		let numInactivePos = org.positions.filter(p => p.status === 'INACTIVE').length

		let positionsNeedingAttention = org.positions.filter(position => !position.person )
		let supportedPositions = org.positions.filter(position => positionsNeedingAttention.indexOf(position) === -1)

		return <div id="laydown" data-jumptarget>
			<Fieldset id="supportedPositions" title="Supported positions" action={<div>
				{numInactivePos > 0 && <Button onClick={this.toggleShowInactive}>
					{(showInactivePositions ? "Hide " : "Show ") + numInactivePos + " inactive position(s)"}
				</Button>}

				{isSuperUser && <LinkTo position={Position.pathForNew({organizationId: org.id})} button>
					Create position
				</LinkTo>}
			</div>}>

				{this.renderPositionTable(supportedPositions)}
				{supportedPositions.length === 0 && <em>There are no occupied positions</em>}
			</Fieldset>

			<Fieldset id="vacantPositions" title="Vacant positions">
				{this.renderPositionTable(positionsNeedingAttention)}
				{positionsNeedingAttention.length === 0 && <em>There are no vacant positions</em>}
			</Fieldset>
		</div>
	}

	renderPositionTable(positions) {
		let org = this.props.organization
		let posNameHeader, posPersonHeader, otherNameHeader, otherPersonHeader
		if (org.type === 'ADVISOR_ORG') {
			posNameHeader = 'Billet'
			posPersonHeader = 'Advisor'
			otherNameHeader = 'TASHKIL'
			otherPersonHeader = 'Afghan'
		} else {
			otherNameHeader = 'Billet'
			otherPersonHeader = 'Advisor'
			posNameHeader = 'TASHKIL'
			posPersonHeader = 'Afghan'
		}
		return <Table>
			<thead>
				<tr>
					<th>{posNameHeader}</th>
					<th>{posPersonHeader}</th>
					<th>{otherPersonHeader}</th>
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
		let otherPersonCol, otherNameCol, positionPersonCol, positionNameCol
		if (position.status === 'INACTIVE' && this.state.showInactivePositions === false) {
			return
		}

		if (other) {
			key += '.' + other.id
			otherNameCol = <td><LinkTo position={other} >{this.positionWithStatus(other)}</LinkTo></td>

			otherPersonCol = other.person
				? <td><LinkTo person={other.person} >{this.personWithStatus(other.person)}</LinkTo></td>
				: <td className="text-danger">Unfilled</td>
		}

		if (otherIndex === 0) {
			positionNameCol = <td><LinkTo position={position} >{this.positionWithStatus(position)}</LinkTo></td>
			positionPersonCol = (position.person && position.person.id)
					? <td><LinkTo person={position.person} >{this.personWithStatus(position.person)}</LinkTo></td>
					: <td className="text-danger">Unfilled</td>
		}

		otherPersonCol = otherPersonCol || <td></td>
		otherNameCol = otherNameCol || <td></td>
		positionPersonCol = positionPersonCol || <td></td>
		positionNameCol = positionNameCol || <td></td>



		return <tr key={key}>
			{positionNameCol}
			{positionPersonCol}
			{otherPersonCol}
			{otherNameCol}
		</tr>
	}

	personWithStatus(person) {
		person = new Person(person)
		if (person.status === 'INACTIVE') {
			return <i>{person.toString() + " (Inactive)"}</i>
		} else {
			return person.toString()
		}
	}

	positionWithStatus(pos) {
		let code = (pos.code) ? ` (${pos.code})` : ''
		if (pos.status === 'INACTIVE') {
			return <i>{`${pos.name}${code} (Inactive)`}</i>
		} else {
			return pos.name + code
		}
	}

	@autobind
	toggleShowInactive() {
		this.setState({showInactivePositions: !this.state.showInactivePositions})
	}
}
