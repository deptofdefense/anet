import React, {Component} from 'react'

import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'

export default class PoamForm extends Component {
	static propTypes = {
		poam: React.PropTypes.object,
		onChange: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		edit: React.PropTypes.bool,
		actionText: React.PropTypes.string,
		error: React.PropTypes.object,
	}

	render() {
		let {poam, onChange, onSubmit, actionText, error} = this.props

		return <Form formFor={poam} onChange={onChange}
			onSubmit={onSubmit} horizontal
			actionText={actionText}>

			{error && <fieldset>
				<p>There was a problem saving this poam</p>
				<p>{error}</p>
				</fieldset>}

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
