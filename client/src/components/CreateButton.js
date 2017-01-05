import React, {Component} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import History from 'components/History'
import {Report, Person, Position, Organization, Poam} from 'models'

const RESOURCES = {
	"Report": Report.pathFor(null),
	"Person": Person.pathFor(null),
	"Position": Position.pathFor(null),
	"Organization": Organization.pathFor(null),
	"Poam": Poam.pathFor(null),
}

export default class CreateButton extends Component {
	render() {
		return (
			<DropdownButton title="Create" bsStyle="primary" id="createButton" onSelect={this.onSelect}>
				{Object.keys(RESOURCES).map(resource =>
					<MenuItem key={resource} eventKey={resource}>{resource}</MenuItem>
				)}
			</DropdownButton>
		)
	}

	onSelect(resource) {
		History.push(RESOURCES[resource])
	}
}
