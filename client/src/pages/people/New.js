import React from 'react'
import autobind from 'autobind-decorator'


import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Breadcrumbs from 'components/Breadcrumbs'
import Page from 'components/Page'
import PersonForm from 'components/PersonForm'

import API from 'api'
import {Person} from 'models'

export default class PersonNew extends Page {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
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

				<Breadcrumbs items={[['Create new Person', '/people/new']]} />
				<PersonForm 
					person={person} 
					onChange={this.onChange} 
					onSubmit={this.onSubmit} 
					actionText="Create Person"
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

		API.send('/api/people/new', this.state.person, {disableSubmits: true})
			.then(person => {
				if (person.code) throw person.code
				History.push(Person.pathFor(person))
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
