import React, {PropTypes} from 'react'
import Page from 'components/Page'
import moment from 'moment'

import PersonForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'

import API from 'api'
import {Person} from 'models'

export default class PersonEdit extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
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
			if (data.person.status === 'NEW_USER') {
				//this is the inital setup of this user
				data.person.status = 'ACTIVE'
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

				<Breadcrumbs items={[[`Edit ${person.name}`, Person.pathForEdit(person)]]} />

				<PersonForm person={person} edit showPositionAssignment={canEditPosition} />
			</div>
		)
	}
}
