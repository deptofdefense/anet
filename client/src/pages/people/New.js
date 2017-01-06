import React from 'react'
import {InputGroup} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from 'components/Header'
import History from 'components/History'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'

import API from 'api'
import {Person} from 'models'

export default class PersonNew extends React.Component {
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

				<Form formFor={person} onChange={this.onChange} onSubmit={this.onSubmit} horizontal actionText="Create person">
					{this.state.error && <fieldset><p>There was a problem saving this person</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Person</legend>
						<Form.Field id="name" />
						<Form.Field id="role" componentClass="select">
							<option value="ADVISOR">Advisor</option>
							<option value="PRINCIPAL">Principal</option>
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Additional Information</legend>
						<Form.Field id="emailAddress" label="Email" />
						<Form.Field id="phoneNumber" label="Phone Number" />
						<Form.Field id="rank"  componentClass="select">
							<option value="OF-1" >OF-1</option>
							<option value="OF-2" >OF-2</option>
							<option value="OF-3" >OF-3</option>
							<option value="OF-4" >OF-4</option>
							<option value="OF-5" >OF-5</option>
							<option value="OF-6" >OF-6</option>
						</Form.Field>

						<Form.Field id="gender" componentClass="select">
							<option>Male</option>
							<option>Female</option>
						</Form.Field>

						<Form.Field id="country" componentClass="select">
							<option>Afghanistan</option>
							<option>Australia</option>
							<option>Romania</option>
							<option>Turkey</option>
							<option>United States of America</option>
							<option>United Kingdom</option>
							<option>Germany</option>
						</Form.Field>

						<Form.Field id="endOfTourDate">
							<DatePicker placeholder="End of Tour Date">
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</Form.Field>

						<Form.Field id="biography" >
							<TextEditor label="" />
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Position</legend>
						<Form.Field id="position" >
							<Autocomplete valueKey="name"  
								placeholder="Select a position for this person"
								url="/api/positions/search"
								urlParams={"&type=" + person.role} />
						</Form.Field>
						<span>You can optionally assign this person to a position now</span>
					</fieldset>

				</Form>
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
