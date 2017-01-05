import React, {Component} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import History from 'components/History'
import * as Models from 'models'

export default class CreateButton extends Component {
	static contextTypes = {
		app: React.PropTypes.object,
	}

	render() {
		const currentUser = this.context.app.state.currentUser
		const MODEL_CLASSES = [
			Models.Report,
		]

		if (currentUser.isSuperUser()) {
			MODEL_CLASSES.push(Models.Person, Models.Position, Models.Poam)
		}

		if (currentUser.isAdmin()) {
			MODEL_CLASSES.push(Models.Organization)
		}

		return (
			<DropdownButton title="Create" bsStyle="primary" id="createButton" onSelect={this.onSelect}>
				{MODEL_CLASSES.map((modelClass, i) =>
					<MenuItem key={modelClass.name} eventKey={modelClass}>Create {modelClass.name}</MenuItem>
				)}
			</DropdownButton>
		)
	}

	onSelect(modelClass) {
		History.push(modelClass.pathFor(null))
	}
}
