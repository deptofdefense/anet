import React, {Component} from 'react'
import autobind from 'autobind-decorator'

import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import {Table, Button} from 'react-bootstrap'

export default class PoamsSelector extends Component {
	static propTypes = {
		poams: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func.isRequired,
		shortcuts: React.PropTypes.array
	}

	render() {
		let {poams, shortcuts} = this.props;

		return <fieldset>
			<legend>Plan of Action and Milestones / Pillars</legend>

			<Form.Field id="poams">
				<Autocomplete url="/api/poams/search" template={poam =>
					<span>{[poam.shortName, poam.longName].join(' - ')}</span>
				} onChange={this.addPoam} clearOnSelect={true} />

				<Table hover striped>
					<thead>
						<tr>
							<th></th>
							<th>Name</th>
							<th>AO</th>
						</tr>
					</thead>
					<tbody>
						{poams.map(poam =>
							<tr key={poam.id}>
								<td onClick={this.removePoam.bind(this, poam)}>
									<span style={{cursor: 'pointer'}}>⛔️</span>
								</td>
								<td>{poam.longName}</td>
								<td>{poam.shortName}</td>
							</tr>
						)}
					</tbody>
				</Table>

				{ shortcuts && this.renderShortcuts() }
			</Form.Field>
		</fieldset>
	}

	renderShortcuts() {
		let shortcuts = this.props.shortcuts || [];
		return <Form.Field.ExtraCol className="shortcut-list">
			<h5>Shortcuts</h5>
				{shortcuts.map(poam =>
					<Button key={poam.id} bsStyle="link" onClick={this.addPoam.bind(this, poam)}>Add "{poam.longName}"</Button>
				)}
			</Form.Field.ExtraCol>
	}

	@autobind
	addPoam(newPoam) {
		let poams = this.props.poams

		if (!poams.find(poam => poam.id === newPoam.id)) {
			poams.push(newPoam)
		}

		this.props.onChange()
	}

	@autobind
	removePoam(oldPoam) {
		let poams = this.props.poams
		let index = poams.findIndex(poam => poam.id === oldPoam.id)

		if (index !== -1) {
			poams.splice(index, 1)
			this.props.onChange()
		}
	}
}
