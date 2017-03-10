import React, {PropTypes} from 'react'
import Page from 'components/Page'

import PoamForm from './Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import NavigationWarning from 'components/NavigationWarning'

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
			originalPoam: new Poam()
		}
	}

	fetchData(props) {
		if (props.location.query.responsibleOrg) {
			API.query(/* GraphQL */`
				organization(id: ${props.location.query.responsibleOrg}) {
					id, shortName, longName, type
				}
			`).then(data => {
				let poam = this.state.poam
				poam.responsibleOrg = new Organization(data.organization)
				this.state.originalPoam.responsibleOrg = new Organization(data.organization)
				this.setState({poam})
			})
		}
	}

	render() {
		let poam = this.state.poam

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new PoAM</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new PoAM', Poam.pathForNew()]]} />

				<Messages error={this.state.error} success={this.state.success} />

				<NavigationWarning original={this.state.originalPoam} current={poam} />
				<PoamForm poam={poam} />
			</div>
		)
	}
}
