import React from 'react'
import {Form, FormGroup, Col, ControlLabel} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import Breadcrumbs from '../../components/Breadcrumbs'
import TextEditor from '../../components/TextEditor'

export default class ReportNew extends React.Component {
	render() {
		let HorizontalControl = function(props) {
			return (
				<FormGroup controlId={props.controlId}>
					<Col sm={3} componentClass={ControlLabel}>
						Engagement date
					</Col>
					<Col sm={9}>
						{props.children}
					</Col>
				</FormGroup>
			)
		}

		return (
			<div>
				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form horizontal>
					<fieldset>
						<legend>Engagement details</legend>

						<HorizontalControl controlId="engagementDate">
							<DatePicker />
						</HorizontalControl>

						<HorizontalControl controlId="engagementDetails">
							<TextEditor />
						</HorizontalControl>
					</fieldset>
				</Form>
			</div>
		)
	}
}
