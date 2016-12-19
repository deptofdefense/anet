import React from 'react'
import {Form} from 'react-bootstrap'
import {Link} from 'react-router'
import moment from 'moment'

import API from '../../api'
import Breadcrumbs from '../../components/Breadcrumbs'
import {HorizontalFormField} from '../../components/FormField'

export default class ReportShow extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			report: {},
			location: {},
		}
	}

	componentDidMount() {
		API.fetch('/api/reports/' + this.props.params.id)
			.then(data => this.setState({report: data}))
			.then(() => {
				let location = this.state.report.location
				if (location && location.id && !location.name) {
					API.fetch('/api/locations/' + location.id)
						.then(data => this.setState({location: data}))
				} else {
					this.setState({location})
				}
			})
	}

	render() {
		let {report, location} = this.state
		let breadcrumbName = report.intent || 'Report'
		let breadcrumbUrl = '/reports/' + (report.id || this.props.params.id)

		let atmosphereString = report.atmosphere
		if (report.atmosphereDetails) atmosphereString += ": " + report.atmosphereDetails

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [breadcrumbName, breadcrumbUrl]]} />

				<Form horizontal>
					<fieldset>
						<legend>Report #{report.id}</legend>
						<HorizontalFormField label="Subject" type="static" value={report.intent} />
						<HorizontalFormField label="Date" type="static" value={moment(report.engagementDate).format("L LT")} />
						<HorizontalFormField label="Location" type="static" value={location && location.name} extra="📍"/>
						<HorizontalFormField label="Atmospherics" type="static" value={atmosphereString} />
						<HorizontalFormField label="Report author" type="static">
							{report.author &&
								<Link to={"/users/" + report.author.id}>{report.author.name}</Link>
							}
						</HorizontalFormField>
					</fieldset>

					<fieldset>
						<legend>Meeting attendees</legend>
						{report.attendees && report.attendees.map(person =>
							person.name
						)}
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>
					</fieldset>
				</Form>
			</div>
		)
	}
}
