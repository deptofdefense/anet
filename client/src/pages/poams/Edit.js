import React from 'react'
import Page from 'components/Page'

import PoamForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'

import API from 'api'
import {Poam} from 'models'
import NotFound from 'components/NotFound'

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
		API.query(/* GraphQL */`
			poam(id:${props.params.id}) {
				id,
				shortName,
				longName,
				responsibleOrg {id,shortName, longName}
			}
		`).then(data => {
			PoamEdit.pageProps.fluidContainer = !Boolean(data.poam)
			this.setState({poam: data.poam ? new Poam(data.poam) : null})
		}, err => {
			if (err.errors[0] === 'Invalid Syntax') {
				PoamEdit.pageProps = {fluidContainer: true, useNavigation: false}
				this.setState({poam: null})
			}
		})
	}

	render() {
		let poam = this.state.poam

		if (!poam) {
			return <NotFound text={`No PoAM with ID ${this.props.params.id} was found.`} />
		}

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
