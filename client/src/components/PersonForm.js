import React, {Component} from 'react'

import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import DatePicker from 'react-bootstrap-date-picker'
import {InputGroup} from 'react-bootstrap'

export default class PersonForm extends Component {
	static propTypes = {
		person: React.PropTypes.object,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		edit: React.PropTypes.bool,
		actionText: React.PropTypes.string,
		error: React.PropTypes.object,
	}

	render() {
		let {person, onChange, onSubmit, actionText, error} = this.props

		return <Form formFor={person} onChange={onChange}
			onSubmit={onSubmit} horizontal
			actionText={actionText}>

			{error &&
				<fieldset>
					<p>There was a problem saving this person</p>
					<p>{error}</p>
				</fieldset>}

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
					<option />
					<option value="MALE" >Male</option>
					<option value="FEMALE" >Female</option>
				</Form.Field>

				<Form.Field id="country" componentClass="select">
					<option />
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
					<TextEditor label="" value={person.biography} />
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
	}
}
