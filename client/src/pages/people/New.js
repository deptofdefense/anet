import React, {PropTypes} from 'react'
import Page from 'components/Page'

import PersonForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'

import {Person} from 'models'

export default class PersonNew extends Page {
	static contextTypes = {
		router: PropTypes.object.isRequired
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

	render() {
		let person = this.state.person

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Person</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Create new Person', Person.pathForNew()]]} />

				<PersonForm person={person} showPositionAssignment={true} />
			</div>
		)
	}
}
