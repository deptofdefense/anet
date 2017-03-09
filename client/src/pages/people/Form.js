import React, {Component, PropTypes} from 'react'
import DatePicker from 'react-bootstrap-date-picker'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import Messages from 'components/Messages'
import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import History from 'components/History'

import _some from 'lodash.some'
import _values from 'lodash.values'

import API from 'api'
import {Person} from 'models'

import CALENDAR_ICON from 'resources/calendar.png'

export default class PersonForm extends Component {
	static propTypes = {
		person: PropTypes.object.isRequired,
		edit: PropTypes.bool,
		showPositionAssignment: PropTypes.bool,
		legendText: PropTypes.string,
		saveText: PropTypes.string,
	}

	constructor(props) {
		super(props)

		this.state = {
			error: null,
			formErrors: {}
		}
	}

	render() {
		let {person, edit, showPositionAssignment} = this.props
		const isAdvisor = person.role === 'ADVISOR'
		const legendText = this.props.legendText || (edit ? `Edit ${person.name}` : 'Create a new person')

		return <Form formFor={person} onChange={this.onChange} 
					onSubmit={this.onSubmit} 
					horizontal 
					submitText={this.props.saveText || 'Save person'}
					submitDisabled={this.isSubmitDisabled()}>
					 
			<Messages error={this.state.error} />

			<fieldset>
				<legend>{legendText}</legend>

				<Form.Field id="name" 
					required
					humanName="Name"
					onError={() => this.onFieldEnterErrorState('name')}
					onValid={() => this.onFieldExitErrorState('name')} />

				{edit ?
					<Form.Field type="static" id="role" />
					:
					<Form.Field id="role" componentClass="select">
						<option value="ADVISOR">Advisor</option>
						<option value="PRINCIPAL">Principal</option>
					</Form.Field>
				}
			</fieldset>

			<fieldset>
				<legend>Additional Information</legend>
				<Form.Field id="emailAddress" label="Email" required={isAdvisor} 
					humanName="Valid email address"
					type="email"
					onError={() => this.onFieldEnterErrorState('emailAddress')}
					onValid={() => this.onFieldExitErrorState('emailAddress')} />
				<Form.Field id="phoneNumber" label="Phone Number" />
				<Form.Field id="rank"  componentClass="select"
					required={isAdvisor} 
					humanName="Rank"
					onError={() => this.onFieldEnterErrorState('rank')}
					onValid={() => this.onFieldExitErrorState('rank')}>

					<option />
					<option value="OF-1" >OF-1</option>
					<option value="OF-2" >OF-2</option>
					<option value="OF-3" >OF-3</option>
					<option value="OF-4" >OF-4</option>
					<option value="OF-5" >OF-5</option>
					<option value="OF-6" >OF-6</option>
					<option value="CIV">CIV</option>
					<option value="CTR">CTR</option>
				</Form.Field>

				<Form.Field id="gender" componentClass="select"
					required={isAdvisor} 
					humanName="Gender"
					onError={() => this.onFieldEnterErrorState('gender')}
					onValid={() => this.onFieldExitErrorState('gender')}>
					<option />
					<option value="MALE" >Male</option>
					<option value="FEMALE" >Female</option>
				</Form.Field>

				<Form.Field id="country" componentClass="select"
					required={isAdvisor} 
					humanName="Country"
					onError={() => this.onFieldEnterErrorState('country')}
					onValid={() => this.onFieldExitErrorState('country')}>
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
				</Form.Field>

				<Form.Field id="endOfTourDate" addon={CALENDAR_ICON}>
					<DatePicker placeholder="End of Tour Date" dateFormat="DD/MM/YYYY" />
				</Form.Field>

				<Form.Field id="biography">
					<TextEditor label="" value={person.biography} />
				</Form.Field>
			</fieldset>

			{showPositionAssignment &&
				<fieldset>
					<legend>Position</legend>
					<Form.Field id="position" >
						<Autocomplete valueKey="name"
							placeholder="Select a position for this person"
							url="/api/positions/search"
							template={pos =>
								<span>{[pos.name, pos.code].join(' - ')}</span>
							}
							queryParams={{type: person.role}} />
					</Form.Field>
					<span>You can optionally assign this person to a position now</span>
				</fieldset>
			}
		</Form>
	}

	@autobind
	onChange() {
		this.forceUpdate()
	}

	@autobind
	onFieldEnterErrorState(fieldName) {
		this.setState({formErrors: {[fieldName]: true}})
	}

	@autobind
	onFieldExitErrorState(fieldName) {
		this.setState({formErrors: {[fieldName]: false}})
	}

	@autobind
	isSubmitDisabled() {
		return _some(_values(this.state.formErrors))
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
					window.localStorage.showGettingStartedPanel = 'true'
					History.push('/')	
				} else {
					if (response.id) {
						person.id = response.id
					}
					
					History.replace(Person.pathForEdit(person), false)
					History.push(Person.pathFor(person), {success: 'Person saved successfully'})
				}
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}
}
