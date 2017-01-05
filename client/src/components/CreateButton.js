import React, {Component} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import History from 'components/History'
import * as Models from 'models'

const RESOURCES = [
	Models.Report,
	Models.Person,
	Models.Position,
	Models.Organization,
	Models.Poam,
]

export default class CreateButton extends Component {
	render() {
		return (
			<DropdownButton title="Create" bsStyle="primary" id="createButton" onSelect={this.onSelect}>
				{RESOURCES.map((resource, i) =>
					<MenuItem key={resource.name} eventKey={i}>Create {resource.name}</MenuItem>
				)}
			</DropdownButton>
		)
	}

	onSelect(index) {
		History.push(RESOURCES[index].pathFor(null))
	}
}
