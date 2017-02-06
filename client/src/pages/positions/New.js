import React from 'react'
import Page from 'components/Page'

import PositionForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'

import API from 'api'
import {Position, Organization} from 'models'

export default class PositionNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			position:  new Position( {type: "ADVISOR"}),
		}
	}

	fetchData(props) {
		if (props.location.query.organizationId) {
			//If an organizationId was given in query parameters,
			// then look that org up and pre-populate the field.
			API.query(/* GraphQL */`
				organization(id:${props.location.query.organizationId}) {
					id, shortName, longName, type
				}
			`).then(data => {
				let organization = new Organization(data.organization)
				this.setState({
					position : new Position({
						type: organization.isAdvisorOrg() ? 'ADVISOR' : 'PRINCIPAL',
						organization: organization,
					})
				})
			})
		}
	}

	render() {
		let position = this.state.position

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Position</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Position', Position.pathForNew()]]} />

				<PositionForm position={position} />
			</div>
		)
	}
}
