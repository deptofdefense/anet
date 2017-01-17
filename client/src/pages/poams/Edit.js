import React from 'react'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import Page from 'components/Page'
import PoamForm from 'components/PoamForm'

import API from 'api'
import {Poam} from 'models'

export default class PoamEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			poam: new Poam(),
		}
	}

	fetchData(props) {
		API.query(/*GraphQL*/ `
			poam(id:${props.params.id}) {
				id,
				shortName,
				longName,
				responsibleOrg {id,shortName, longName}
			}
		`).then(data => {
			this.setState({poam: new Poam(data.poam)})
		})
	}

	render() {
		let poam = this.state.poam

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Poam</h2>
				</ContentForHeader>

				<Breadcrumbs items={[[`Edit ${poam.shortName}`, `/poams/${poam.id}/edit`]]} />
				<PoamForm
					poam={poam}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					submitText="Save Poam"
					edit
					error={this.state.error}/>
			</div>
		)
	}

	@autobind
	onChange() {
		let poam = this.state.poam
		this.setState({poam})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		API.send('/api/poams/update', this.state.poam, {disableSubmits: true})
			.then(response => {
				if (response.code) throw response.code
				History.push(Poam.pathFor(this.state.poam))
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
