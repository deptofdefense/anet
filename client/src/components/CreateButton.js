import React, {Component} from 'react'
import {DropdownButton, MenuItem, Button} from 'react-bootstrap'
import History from 'components/History'
import * as Models from 'models'

const DEFAULT_ACTIONS = [
	Models.Report,
]

const SUPER_USER_ACTIONS = [
	Models.Person,
	Models.Position,
	Models.Poam,
	Models.Location,
]

const ADMIN_ACTIONS = [
	Models.Organization,
]

export default class CreateButton extends Component {
	static contextTypes = {
		app: React.PropTypes.object,
	}

	render() {
		const currentUser = this.context.app.state.currentUser

		const modelClasses = DEFAULT_ACTIONS.concat(
			currentUser.isSuperUser() && SUPER_USER_ACTIONS,
			currentUser.isAdmin() && ADMIN_ACTIONS,
		).filter(value => !!value)

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
