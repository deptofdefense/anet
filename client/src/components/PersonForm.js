import React, {Component, PropTypes} from 'react'

import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import DatePicker from 'react-bootstrap-date-picker'
import {InputGroup, Alert} from 'react-bootstrap'

export default class PersonForm extends Component {
	static propTypes = {
		person: PropTypes.object,
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		edit: PropTypes.bool,
		submitText: PropTypes.string,
		error: PropTypes.object,
		showPositionAssignment: PropTypes.bool
	}

	render() {
		let {person, onChange, onSubmit, submitText, error, edit, showPositionAssignment} = this.props

		return <Form formFor={person} onChange={onChange}
			onSubmit={onSubmit} horizontal
			submitText={submitText}>

			{error &&
				<Alert bsStyle="danger">
					<p>There was a problem saving this person</p>
					<p>{error.statusText}: {error.message}</p>
				</Alert>}

			<fieldset>
				<legend>{edit ? "Edit " + person.name : "Create a new Person"}</legend>
				<Form.Field id="name" />
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
				<Form.Field id="emailAddress" label="Email" />
				<Form.Field id="phoneNumber" label="Phone Number" />
				<Form.Field id="rank"  componentClass="select">
					<option value="OF-1" >OF-1</option>
					<option value="OF-2" >OF-2</option>
					<option value="OF-3" >OF-3</option>
					<option value="OF-4" >OF-4</option>
					<option value="OF-5" >OF-5</option>
					<option value="OF-6" >OF-6</option>
					<option value="CIV">CIV</option>
					<option value="CTR">CTR</option>
				</Form.Field>

				<Form.Field id="gender" componentClass="select">
					<option />
					<option value="MALE" >Male</option>
					<option value="FEMALE" >Female</option>
				</Form.Field>

				<Form.Field id="country" componentClass="select">
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

				<Form.Field id="endOfTourDate">
					<DatePicker placeholder="End of Tour Date" dateFormat="DD/MM/YYYY">
						<InputGroup.Addon>📆</InputGroup.Addon>
					</DatePicker>
				</Form.Field>

				<Form.Field id="biography" >
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
							queryParams={{type: person.role}} />
					</Form.Field>
					<span>You can optionally assign this person to a position now</span>
				</fieldset>
			}

		</Form>
	}
}
