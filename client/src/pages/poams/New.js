import React, {PropTypes} from 'react'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import Page from 'components/Page'
import Messages from 'components/Messages'
import PoamForm from 'components/PoamForm'

import API from 'api'
import {Poam,Organization} from 'models'

export default class PoamNew extends Page {
	static contextTypes = {
		router: PropTypes.object.isRequired
	}

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
		if (props.location.query.responsibleOrg) {
			API.query(/*GraphQL */ `
				organization(id: ${props.location.query.responsibleOrg}) {
					id,name,type
				}
			`).then(data => {
				let poam = this.state.poam;
				poam.responsibleOrg = new Organization(data.organization)
				this.setState({poam})
			})
		}
	}
	render() {
		let poam = this.state.poam

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Poam</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Poam', '/poams/new']]} />
				<Messages error={this.state.error} success={this.state.success} />
				<PoamForm
					poam={poam}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					submitText="Create Poam" />
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

		API.send('/api/poams/new', this.state.poam, {disableSubmits: true})
			.then(poam => {
				if (poam.code) throw poam.code
				History.push({pathname:Poam.pathFor(poam),state:{success:"Saved POAM"}})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
