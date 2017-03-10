import React from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'

import PositionForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import NavigationWarning from 'components/NavigationWarning'

import API from 'api'
import {Position} from 'models'

class PositionEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	static modelName = 'Position'

	constructor(props) {
		super(props)

		this.state = {
			position: new Position(),
			originalPosition: new Position(),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			position(id:${props.params.id}) {
				id, name, code, type
				location { id, name },
				associatedPositions { id, name  },
				organization {id, shortName, longName, type},
				person { id, name}
			}
		`).then(data => {
			function getPositionFromData() {
				let position = new Position(data.position)
				//need to set type to either ADVISOR or PRINCIPAL and add permissions property.
				//This is undone in the onSubmit method in the Form.
				position.permissions = position.type
				if (position.type === "SUPER_USER" || position.type === "ADMINISTRATOR") {
					position.type = "ADVISOR"
				}
				return position
			}

			this.setState({position: getPositionFromData(), originalPosition: getPositionFromData()})
		})
	}

	render() {
		let position = this.state.position

		return (
			<div>
				<ContentForHeader>
					<h2>Edit Position</h2>
				</ContentForHeader>

				<Breadcrumbs items={[[`Edit ${position.name}`, Position.pathForEdit(position)]]} />

				<NavigationWarning original={this.state.originalPosition} current={position} />
				<PositionForm position={position} edit success={this.state.success} error={this.state.error} />
			</div>
		)
	}
}

export default ModelPage(PositionEdit)
