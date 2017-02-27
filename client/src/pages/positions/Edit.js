import React from 'react'
import Page from 'components/Page'

import PositionForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import NotFound from 'components/NotFound'
import _includes from 'lodash.includes'

import API from 'api'
import {Position} from 'models'

export default class PositionEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

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
			PositionEdit.pageProps.useGrid = true
			this.setState({position: new Position(data.position)})
		}, err => {
			if (_includes([
					'Exception while fetching data: javax.ws.rs.WebApplicationException: Not Found',
					'Invalid Syntax'
			], err.errors[0])) {
				PositionEdit.pageProps.useGrid = false
				this.setState({position: null})
			}	
		})
	}

	render() {
		let position = this.state.position

		if (!position) {
			return <NotFound notFoundText={`Position with ID ${this.props.params.id} not found.`} />
		}

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
