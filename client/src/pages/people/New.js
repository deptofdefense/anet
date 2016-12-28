import React from 'react'
import {InputGroup, Button, FormControl} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from 'components/Header'
import Form from 'components/Form'
import Breadcrumbs from 'components/Breadcrumbs'
import TextEditor from 'components/TextEditor'

import API from 'api'

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
			person: {
				name: '',
				status: 'ACTIVE',
				role: 'PRINCIPAL',
				emailAddress: '',
				phoneNumber: '',
				biography: '',
				gender: 'MALE',
				country: 'Afghanistan',
				rank: 'OF-4',
				endOfTourDate: ''
			}
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

				<Form formFor={person} onChange={this.onChange} onSubmit={this.onSubmit} horizontal>
					{this.state.error && <fieldset><p>There was a problem saving this person</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Create a new Person</legend>
						<Form.Field id="name" label="Name" />
						<Form.Field label="Role" id="role" >
							<FormControl componentClass="select" >
								<option value="ADVISOR">Advisor</option>
								<option value="PRINCIPAL">Principal</option>
							</FormControl>
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Additional Information</legend>
						<Form.Field id="emailAddress" label="Email" />
						<Form.Field id="phoneNumber" label="Phone Number" />
						<Form.Field label="Rank" id="rank" >
							<FormControl componentClass="select" > 
								<option value="OF-1" >OF-1</option>
								<option value="OF-2" >OF-2</option>
								<option value="OF-3" >OF-3</option>
								<option value="OF-4" >OF-4</option>
								<option value="OF-5" >OF-5</option>
								<option value="OF-6" >OF-6</option>
							</FormControl>
						</Form.Field>
						<Form.Field id="gender" label="Gender" >
							<FormControl componentClass="select" >
								<option>Male</option>
								<option>Female</option>
							</FormControl>
						</Form.Field>
						<Form.Field id="country" label="Country" >
							<FormControl componentClass="select" >
								<option>Afghanistan</option>
								<option>Australia</option>
								<option>Romania</option>
								<option>Turkey</option>
								<option>United States of America</option>
								<option>United Kingdom</option>
								<option>Germany</option>
							</FormControl>
						</Form.Field>
						<Form.Field id="endOfTourDate" >
							<DatePicker placeholder="End of Tour Date">
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</Form.Field>
						<Form.Field id="biography" label="Biography" >
							<TextEditor label="" />
						</Form.Field>
					</fieldset>
					
					<fieldset>
						<Button bsSize="large" bsStyle="primary" type="submit" className="pull-right">Create person</Button>
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	onChange() {
		let person = this.state.person
		console.log(person);
		this.setState({person})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		API.send('/api/people/new', this.state.person, {disableSubmits: true})
			.then(person => {
				if (person.code) throw person.code
				console.log(person);
				this.context.router.push('/people/' + person.id)
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

}
