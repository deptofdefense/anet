import React, {PropTypes} from 'react'
import Page from 'components/Page'
import moment from 'moment'
import _includes from 'lodash.includes'

import PersonForm from './Form'
import {ContentForHeader} from 'components/Header'
import NotFound from 'components/NotFound'
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

			PersonEdit.pageProps.useGrid = true
			this.setState({person: new Person(data.person)})
		}, err => {
			if (_includes([
				'Exception while fetching data: javax.ws.rs.WebApplicationException: No such person',
				'Invalid Syntax'
			], err.errors[0])) {
				PersonEdit.pageProps = {useGrid: false}
				this.setState({person: null})
			}	
		})
	}

	render() {
		let person = this.state.person
		
		if (!person) {
			return <NotFound text={`User with ID ${this.props.params.id} not found.`} />
		}

		let currentUser = this.context.app.state.currentUser
		let canEditPosition = currentUser && currentUser.isSuperUser()

		const legendText = person.status === 'NEW_USER' ? 'Create your account' : `Edit ${person.name}`
		const saveText = person.status === 'NEW_USER' ? 'Create profile' : null

		return (
			<div>
				<ContentForHeader>
					<h2>{legendText}</h2>
				</ContentForHeader>

				{person.status !== 'NEW_USER' && 
					<Breadcrumbs items={[[`Edit ${person.name}`, Person.pathForEdit(person)]]} />
				}

				<PersonForm person={person} edit showPositionAssignment={canEditPosition} legendText={legendText} saveText={saveText} />
			</div>
		)
	}
}
