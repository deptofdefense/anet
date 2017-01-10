import React, {Component} from 'react'
import {DropdownButton, MenuItem, Button} from 'react-bootstrap'
import History from 'components/History'
import * as Models from 'models'

export default class CreateButton extends Component {
	static contextTypes = {
		app: React.PropTypes.object,
	}

	render() {
		const currentUser = this.context.app.state.currentUser
		const modelClasses = [
			Models.Report,
		]

		if (currentUser.isSuperUser()) {
			modelClasses.push(Models.Person, Models.Position, Models.Poam, Models.Location)
		}

		if (currentUser.isAdmin()) {
			modelClasses.push(Models.Organization)
		}

		if (modelClasses.length > 1) {
			return (
				<DropdownButton title="Create new" bsStyle="primary" id="createButton" onSelect={this.onSelect}>
					{modelClasses.map((modelClass, i) =>
						<MenuItem key={modelClass.name} eventKey={modelClass}>New {modelClass.name}</MenuItem>
					)}
				</DropdownButton>
			)
		} else if (modelClasses.length) {
			let modelClass = modelClasses[0]
			return (
				<Button bsStyle="primary" onClick={this.onSelect.bind(this, modelClass)}>
					New {modelClass.name}
				</Button>
			)
		}
	}

	onSelect(modelClass) {
		History.push(modelClass.pathForNew())
	}
}
