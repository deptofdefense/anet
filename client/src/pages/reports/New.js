import React from 'react'
import {Form} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from '../../components/Header'
import {HorizontalFormField} from '../../components/FormField'
import Breadcrumbs from '../../components/Breadcrumbs'
import TextEditor from '../../components/TextEditor'

export default class ReportNew extends React.Component {
	render() {
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form horizontal>
					<fieldset>
						<legend>Engagement details</legend>

						<HorizontalFormField
							id="engagementIntent"
							label="Meeting subject" />

						<HorizontalFormField
							id="engagementDate"
							label="Engagement date">
							<DatePicker />
						</HorizontalFormField>

						<HorizontalFormField
							id="engagementLocation"
							label="Engagement location" />

						<HorizontalFormField
							id="engagementDetails"
							label="Engagement details">
							<TextEditor />
						</HorizontalFormField>
					</fieldset>
				</Form>
			</div>
		)
	}
}
