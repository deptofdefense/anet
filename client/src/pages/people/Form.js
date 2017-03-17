import React, {PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import DatePicker from 'react-bootstrap-date-picker'
import autobind from 'autobind-decorator'

import ValidatableFormWrapper from 'components/ValidatableFormWrapper'
import Form from 'components/Form'
import Fieldset from 'components/Fieldset'
import Messages from 'components/Messages'
import TextEditor from 'components/TextEditor'
import History from 'components/History'
import ButtonToggleGroup from 'components/ButtonToggleGroup'

import API from 'api'
import {Person} from 'models'

import CALENDAR_ICON from 'resources/calendar.png'

export default class PersonForm extends ValidatableFormWrapper {
	static propTypes = {
		person: PropTypes.object.isRequired,
		edit: PropTypes.bool,
		legendText: PropTypes.string,
		saveText: PropTypes.string,
	}

	static contextTypes = {
		currentUser: PropTypes.object
	}

	constructor(props) {
		super(props)
		this.state = {
			error: null
		}
	}

	render() {
		let {person, edit} = this.props
		const isAdvisor = person.role === 'ADVISOR'
		const legendText = this.props.legendText || (edit ? `Edit ${person.name}` : 'Create a new person')
		let currentUser = this.context.currentUser

		const {ValidatableForm, RequiredField} = this

		return <ValidatableForm formFor={person} onChange={this.onChange} onSubmit={this.onSubmit} horizontal
			submitText={this.props.saveText || 'Save person'}>

			<Messages error={this.state.error} />

			<Fieldset title={legendText}>
				<RequiredField id="name" />

				{edit ?
					<Form.Field type="static" id="role" value={person.getHumanNameOfRole()} />
					:
					<Form.Field id="role" componentClass="select">
						<option value="ADVISOR">{Person.humanNameOfRole('ADVISOR')}</option>
						<option value="PRINCIPAL">{Person.humanNameOfRole('PRINCIPAL')}</option>
					</Form.Field>
				}

				{person.status === 'NEW_USER' ?
					<Form.Field type="static" id="status" value="New User" />
					:
					<Form.Field id="status" >
						<ButtonToggleGroup>
							<Button id="statusActiveButton" value="ACTIVE">Active</Button>
							<Button id="statusInactiveButton" value="INACTIVE">Inactive</Button>
						</ButtonToggleGroup>
					</Form.Field>
				}
			</Fieldset>

			<Fieldset title="Additional information">
				<RequiredField id="emailAddress" label="Email" required={isAdvisor}
					humanName="Valid email address"
					type="email" />
				<Form.Field id="phoneNumber" label="Phone Number" />
				<RequiredField id="rank"  componentClass="select"
					required={isAdvisor}>

					<option />
					<option value="OR-1">OR-1</option>
					<option value="OR-2">OR-2</option>
					<option value="OR-3">OR-3</option>
					<option value="OR-4">OR-4</option>
					<option value="OR-5">OR-5</option>
					<option value="OR-6">OR-6</option>
					<option value="OR-7">OR-7</option>
					<option value="OR-8">OR-8</option>
					<option value="OR-9">OR-9</option>
					<option value="OF-1">OF-1</option>
					<option value="OF-2">OF-2</option>
					<option value="OF-3">OF-3</option>
					<option value="OF-4">OF-4</option>
					<option value="OF-5">OF-5</option>
					<option value="OF-6">OF-6</option>
					<option value="OF-7">OF-7</option>
					<option value="OF-8">OF-8</option>
					<option value="OF-9">OF-9</option>
					<option value="OF-10">OF-10</option>
					<option value="CIV">CIV</option>
					<option value="CTR">CTR</option>
				</RequiredField>

				<RequiredField id="gender" componentClass="select"
					required={isAdvisor}>
					<option />
					<option value="MALE" >Male</option>
					<option value="FEMALE" >Female</option>
				</RequiredField>

				<RequiredField id="country" componentClass="select"
					required={isAdvisor}>
					<option />
					<option>Afghanistan</option>
					<option>Albania</option>
					<option>Armenia</option>
					<option>Azerbaijan</option>
					<option>Australia</option>
					<option>Austria</option>
					<option>Belgium</option>
					<option>Bosnia-Herzegovina</option>
					<option>Bulgaria</option>
					<option>Croatia</option>
					<option>Czech Republic</option>
					<option>Denmark</option>
					<option>Estonia</option>
					<option>Finland</option>
					<option>Germany</option>
					<option>Georgia</option>
					<option>Greece</option>
					<option>Hungary</option>
					<option>Italy</option>
					<option>Iceland</option>
					<option>Latvia</option>
					<option>Luxembourg</option>
					<option>Lithuania</option>
					<option>Macedonia</option>
					<option>Mongolia</option>
					<option>Montenegro</option>
					<option>Netherlands</option>
					<option>New Zealand</option>
					<option>Norway</option>
					<option>Poland</option>
					<option>Portugal</option>
					<option>Romania</option>
					<option>Sweden</option>
					<option>Slovakia</option>
					<option>Slovenia</option>
					<option>Spain</option>
					<option>Turkey</option>
					<option>United States of America</option>
					<option>United Kingdom</option>
					<option>Ukraine</option>
				</RequiredField>

				<Form.Field id="endOfTourDate" addon={CALENDAR_ICON}>
					<DatePicker placeholder="End of Tour Date" dateFormat="DD/MM/YYYY" />
				</Form.Field>

				<Form.Field id="biography">
					<TextEditor label="" value={person.biography} />
				</Form.Field>
			</Fieldset>
		</ValidatableForm>
	}

	@autobind
	onChange() {
		this.forceUpdate()
	}

	@autobind
	onSubmit(event) {
		let {person, edit} = this.props
		let isFirstTimeUser = false
		if (person.status === 'NEW_USER') {
			isFirstTimeUser = true
			person.status = 'ACTIVE'
		}

		let url = `/api/people/${edit ? 'update' : 'new'}`
		API.send(url, person, {disableSubmits: true})
			.then(response => {
				if (response.code) {
					throw response.code
				}

				if (isFirstTimeUser) {
					localStorage.clear()
					localStorage.newUser = 'true'
					History.push('/', {skipPageLeaveWarning: true})
				} else {
					if (response.id) {
						person.id = response.id
					}

					History.replace(Person.pathForEdit(person), false)
					History.push(Person.pathFor(person), {success: 'Person saved successfully', skipPageLeaveWarning: true})
				}
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
