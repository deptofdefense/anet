import React from 'react'
import {ControlLabel, InputGroup, ButtonGroup, Button} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from '../../components/Header'
import {Form, HorizontalFormField} from '../../components/FormField'
import Breadcrumbs from '../../components/Breadcrumbs'
import TextEditor from '../../components/TextEditor'

export default class ReportNew extends React.Component {
	static useNavigation = false

	constructor(props) {
		super(props)
		this.state = {report: {engagementIntent: ''}}

		this.onFormChange = this.onFormChange.bind(this)
	}

	render() {
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form formFor={this.state.report} onChange={this.onFormChange} horizontal>
					<fieldset>
						<legend>Engagement details <small>Required</small></legend>

						<HorizontalFormField id="engagementIntent" label="Meeting subject" placeholder="What happened?" data-focus>
							<HorizontalFormField.Col>{this.subjectCharactersRemaining()}</HorizontalFormField.Col>
						</HorizontalFormField>

						<HorizontalFormField id="engagementDate">
							<DatePicker placeholder="When did it happen?">
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</HorizontalFormField>

						<HorizontalFormField id="engagementLocation" placeholder="Where did it happen?" addon="📍" />

						<HorizontalFormField id="atmosphere">
							<ButtonGroup bsSize="large">
								<Button>👍</Button>
								<Button>😐</Button>
								<Button>👎</Button>
							</ButtonGroup>
						</HorizontalFormField>
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

	onFormChange(event) {
		this.setState({report: this.state.report})
	}

	subjectCharactersRemaining() {
		let charactersRemaining = 250 - this.state.report.engagementIntent.length
		return charactersRemaining + " characters remaining"
	}
}
