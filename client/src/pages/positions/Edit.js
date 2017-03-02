import React from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'

import PositionForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'

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
			this.setState({position: new Position(data.position)})
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

				<PositionForm position={position} edit success={this.state.success} error={this.state.error} />
			</div>
		)
	}
}

export default ModelPage(PositionEdit)
