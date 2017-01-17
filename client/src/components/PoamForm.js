import React, {Component, PropTypes} from 'react'

import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import {Alert} from 'react-bootstrap'

export default class PoamForm extends Component {
	static propTypes = {
		poam: PropTypes.object,
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		edit: PropTypes.bool,
		submitText: PropTypes.string,
		error: PropTypes.object,
	}

	render() {
		let {poam, onChange, onSubmit, submitText, error} = this.props

		return <Form formFor={poam} onChange={onChange}
			onSubmit={onSubmit} horizontal
			submitText={submitText}>

			{error && <Alert bsStyle="danger">
				<p>There was a problem saving this poam</p>
				<p>{error.statusText}: {error.message}</p>
			</Alert>}

			<fieldset>
					<legend>Create a new Poam</legend>
					<Form.Field id="shortName" />
					<Form.Field id="longName" />
					<Form.Field id="responsibleOrg">
						<Autocomplete valueKey="shortName"
							placeholder="Select a responsible organization for this poam"
							url="/api/organizations/search" />
					</Form.Field>
				</fieldset>
            </Form>
	}
}
