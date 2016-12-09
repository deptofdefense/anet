import React from 'react'
import {Form} from 'react-bootstrap'
import moment from 'moment'

import API from '../../api'
import Breadcrumbs from '../../components/Breadcrumbs'
import {HorizontalFormField} from '../../components/FormField'

export default class ReportShow extends React.Component {
	constructor(props) {
		super(props)
		this.state = {report: {}}
	}

	componentDidMount() {
		API.fetch('/reports/' + this.props.params.id)
			.then(data => this.setState({report: data}))
	}

	render() {
		let report = this.state.report
		let breadcrumbName = report.intent || 'Report'
		let breadcrumbUrl = '/reports/' + (report.id || this.props.params.id)
		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [breadcrumbName, breadcrumbUrl]]} />

				<h2>Report #{report.id}</h2>

				<Form horizontal>
					<fieldset>
						<HorizontalFormField label="Subject" type="static" value={report.intent} />
						<HorizontalFormField label="Date" type="static" value={moment(report.engagementDate).format("L LT")} />
						<HorizontalFormField label="Location" type="static" value={report.engagementLocation} />
					</fieldset>
				</Form>
			</div>
		)
	}
}
