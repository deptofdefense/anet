import React, {PropTypes} from 'react'
import {Button, Alert, HelpBlock} from 'react-bootstrap'
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
		app: PropTypes.object.isRequired,
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
		const legendText = this.props.legendText || (edit ? `Edit Person ${person.name}` : 'Create a new Person')

		const {ValidatableForm, RequiredField} = this

		let willAutoKickPosition = person.status === 'INACTIVE' && person.position && !!person.position.id

		return <ValidatableForm formFor={person} onChange={this.onChange} onSubmit={this.onSubmit} horizontal
			submitText={this.props.saveText || 'Save person'}>

			<Messages error={this.state.error} />

			<Fieldset title={legendText}>
				<RequiredField id="name" />

				{edit ?
					<Form.Field type="static" id="role" value={person.humanNameOfRole()} />
					:
					<Form.Field id="role">
						<ButtonToggleGroup>
							<Button id="roleAdvisorButton" value="ADVISOR">NATO member</Button>
							<Button id="rolePrincipalButton" value="PRINCIPAL">Afghan principal</Button>
						</ButtonToggleGroup>
					</Form.Field>
				}

				{person.isNewUser() ?
					<Form.Field type="static" id="status" value="New user" />
					:
					<Form.Field id="status" >
						<ButtonToggleGroup>
							<Button id="statusActiveButton" value="ACTIVE">Active</Button>
							<Button id="statusInactiveButton" value="INACTIVE">Inactive</Button>
						</ButtonToggleGroup>

						{willAutoKickPosition && <HelpBlock>
							<span className="text-danger">Setting this person to inactive will automatically remove them from the <strong>{person.position.name}</strong> position.</span>
						</HelpBlock> }

					</Form.Field>
				}

				{!edit && person.role === 'ADVISOR' &&
					<Alert bsStyle="warning">
						Creating a NATO member in ANET could result in duplicate accounts if this person logs in later. If you notice duplicate accounts, please contact an ANET administrator.
					</Alert>
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
					<option value="CIV">CIV</option>
					<option value="CTR">CTR</option>
					<option value="OR-1">OR-1</option>
					<option value="OR-2">OR-2</option>
					<option value="OR-3">OR-3</option>
					<option value="OR-4">OR-4</option>
					<option value="OR-5">OR-5</option>
					<option value="OR-6">OR-6</option>
					<option value="OR-7">OR-7</option>
					<option value="OR-8">OR-8</option>
					<option value="OR-9">OR-9</option>
					<option value="WO-1">WO-1</option>
					<option value="WO-2">WO-2</option>
					<option value="WO-3">WO-3</option>
					<option value="WO-4">WO-4</option>
					<option value="WO-5">WO-5</option>
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
					{Person.COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
				</RequiredField>

				<Form.Field id="endOfTourDate" addon={CALENDAR_ICON}>
					<DatePicker placeholder="End of Tour Date" dateFormat="DD/MM/YYYY" showClearButton={false} />
				</Form.Field>

				<Form.Field id="biography" componentClass={TextEditor} className="biography" />
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
		if (person.isNewUser()) {
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
					this.context.app.loadData()
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
