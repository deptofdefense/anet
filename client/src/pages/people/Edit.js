import React from 'react'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import Page from 'components/Page'
import PersonForm from 'components/PersonForm'
import moment from 'moment'

import API from 'api'
import {Person} from 'models'

export default class PersonEdit extends Page {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			person: new Person(),
		}
	}

	fetchData(props) {
		API.query(/*GraphQL*/ `
			person(id:${props.params.id}) {
				id,
				name, rank, role, emailAddress, phoneNumber, status
				biography, country, gender, endOfTourDate,
				position {
					id, name
				}
			}
		`).then(data => {
			if (data.person.endOfTourDate) {
				data.person.endOfTourDate = moment(data.person.endOfTourDate).format()
			}
			if (data.person.status === "NEW_USER") {
				//this is the inital setup of this user
				data.person.status = "ACTIVE"
			}
			this.setState({person: new Person(data.person)})
		})
	}

	render() {
		let person = this.state.person

		let currentUser = this.context.app.state.currentUser
		let canEditPosition = currentUser && currentUser.isSuperUser()

		return (
			<div>
				<ContentForHeader>
					<h2>Edit {person.name}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[[`Edit ${person.name}`, `/people/${person.id}/edit`]]} />
				<PersonForm
					person={person}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					actionText="Save Person"
					edit
					showPositionAssignment={canEditPosition}
					error={this.state.error}/>
			</div>
		)
	}

	@autobind
	onChange() {
		let person = this.state.person
		this.setState({person})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		API.send('/api/people/update', this.state.person, {disableSubmits: true})
			.then(response => {
				if (response.code) throw response.code
				History.push(Person.pathFor(this.state.person))
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
