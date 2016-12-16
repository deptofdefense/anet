import React from 'react'
import {ControlLabel, InputGroup, Radio} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from '../../components/Header'
import {Form, HorizontalFormField} from '../../components/FormField'
import RadioGroup from '../../components/RadioGroup'
import Breadcrumbs from '../../components/Breadcrumbs'
import TextEditor from '../../components/TextEditor'

export default class ReportNew extends React.Component {
	static useNavigation = false

	constructor(props) {
		super(props)
		this.state = {report: {engagementIntent: ''}, reportAtmosphere: 'positive'}

		this.onFormChange = this.onFormChange.bind(this)
		this.onAtmosphereChange = this.onAtmosphereChange.bind(this)
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
							<RadioGroup onChange={this.onAtmosphereChange}>
								<Radio value="positive">👍</Radio>
								<Radio value="neutral">😐</Radio>
								<Radio value="negative">👎</Radio>
							</RadioGroup>
						</HorizontalFormField>

						<HorizontalFormField id="atmosphereDetails" className={this.state.reportAtmosphere === 'positive' && 'hide'} />
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

	onAtmosphereChange(atmosphere) {
		this.setState({reportAtmosphere: atmosphere})
	}

	subjectCharactersRemaining() {
		let charactersRemaining = 250 - this.state.report.engagementIntent.length
		return charactersRemaining + " characters remaining"
	}
}
