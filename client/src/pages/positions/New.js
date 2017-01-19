import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import History from 'components/History'
import PositionForm from 'components/PositionForm'

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
				<PositionForm
					position={position}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					submitText="Create Position"
					edit
					error={this.state.error} />
			</div>
		)
	}


	@autobind
	onChange() {
		let position = this.state.position
		if ((!position.type) && position.organization) {
			if (position.organization.type === "ADVISOR_ORG") {
				position.type = "ADVISOR"
			} else {
				position.type = "PRINCIPAL"
			}
		}
		this.setState({position})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let position = this.state.position
		position.organization = {id: position.organization.id}
		console.log(position)

		API.send('/api/positions/new', position, {disableSubmits: true})
			.then(response => {
				History.push("/positions/" + response.id);
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
