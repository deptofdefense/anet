import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import PositionForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import History from 'components/History'

import API from 'api'
import {Position, Organization} from 'models'

export default class PositionNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			position:  new Position(),
		}
	}

	fetchData(props) {
		if (props.location.query.organizationId) {
			API.query( /*GraphQL */`
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
				<Messages error={this.state.error} />
				<PositionForm
					position={position}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					submitText="Create Position"
					edit />
			</div>
		)
	}


	@autobind
	onChange() {
		let position = this.state.position
		if ((!position.type) && position.organization) {
			if (position.organization.type === "ADVISOR_ORG") {
				position.type = "ADVISOR"
			} else if(position.organization.type === "PRINCIPAL_ORG") {
				position.type = "PRINCIPAL"
			}
		} else if (position.organization && position.organization.type === "PRINCIPAL_ORG") {
			position.type = "PRINCIPAL"
		}
		this.setState({position})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let position = this.state.position
		position.organization = {id: position.organization.id}

		API.send('/api/positions/new', position, {disableSubmits: true})
			.then(response => {
				History.push({pathname:Position.pathFor(this.state.position) + response.id,state:{success:"Saved Position"}})
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
