import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import PositionForm from './Form'
import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'

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
		API.query(/*GraphQL*/ `
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

				<Breadcrumbs items={[[`Edit ${position.name}`, `/positions/${position.id}/edit`]]} />
				<Messages success={this.state.success} error={this.state.error} />
				<PositionForm
					position={position}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					submitText="Save Position"
					edit
					error={this.state.error}/>
			</div>
		)
	}

	@autobind
	onChange() {
		let position = this.state.position
		this.setState({position})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		API.send('/api/positions/update', this.state.position, {disableSubmits: true})
			.then(response => {
				if (response.code) throw response.code
				History.push({pathname:Position.pathFor(this.state.position),state:{success:"Saved Position"}})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
