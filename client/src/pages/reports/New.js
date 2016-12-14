import React from 'react'
import {Form, ControlLabel} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from '../../components/Header'
import {HorizontalFormField} from '../../components/FormField'
import Breadcrumbs from '../../components/Breadcrumbs'
import TextEditor from '../../components/TextEditor'

export default class ReportNew extends React.Component {
	static useNavigation = false

	componentDidMount() {
		let input = this.refs.container.querySelector('[data-focus]')
		if (input) input.focus()
	}

	render() {
		return (
			<div ref="container">
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form horizontal>
					<fieldset>
						<legend>Engagement details <small>Required</small></legend>

						<HorizontalFormField id="engagementIntent" label="Meeting subject" placeholder="What happened?" data-focus />

						<HorizontalFormField id="engagementDate">
							<DatePicker placeholder="When did it happen?" />
						</HorizontalFormField>

						<HorizontalFormField id="engagementLocation" placeholder="Where did it happen?" />
					</fieldset>

					<fieldset>
						<legend>Meeting attendance <small>Required</small></legend>

						<HorizontalFormField id="addAttendee" placeholder="Who was there?">

						</HorizontalFormField>
					</fieldset>

					<fieldset>
						<legend>Meeting discussion <small>Required</small></legend>

						<ControlLabel>Discussion outcome</ControlLabel>
						<TextEditor />

						<ControlLabel>Next steps</ControlLabel>
						<TextEditor />
					</fieldset>
				</Form>
			</div>
		)
	}
}
