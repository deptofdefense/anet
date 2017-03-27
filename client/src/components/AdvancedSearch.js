import React, {Component} from 'react'
import {Button} from 'react-bootstrap'

import ButtonToggleGroup from 'components/ButtonToggleGroup'

export default class AdvancedSearch extends Component {
	constructor(props) {
		super(props)

		this.state = {
			objectType: "ALL"
		}
	}

	render() {
		return <div>
			<ButtonToggleGroup value={this.state.objectType} onChange={this.changeObjectType}>
				<Button value="ALL">All</Button>
				<Button value="REPORTS">Reports</Button>
				<Button value="PEOPLE">People</Button>
				<Button value="ORGANZIATIONS">Organizations</Button>
				<Button value="POSITIONS">Positions</Button>
			</ButtonToggleGroup>
		</div>
	}
}
