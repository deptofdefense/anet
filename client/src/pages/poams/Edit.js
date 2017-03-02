import React from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'

import PoamForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'

import API from 'api'
import {Poam} from 'models'

class PoamEdit extends Page {
	static pageProps = {
		useNavigation: false
	}
	static modelName = 'PoAM'

	constructor(props) {
		super(props)

		this.state = {
			poam: new Poam(),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
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
					<h2>Edit PoAM {poam.shortName}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[[`PoAM ${poam.shortName}`, Poam.pathFor(poam)], ["Edit", Poam.pathForEdit(poam)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				<PoamForm poam={poam} edit />
			</div>
		)
	}
}

export default ModelPage(PoamEdit)
