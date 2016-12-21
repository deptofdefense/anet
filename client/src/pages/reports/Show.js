import React from 'react'
import {Form} from 'react-bootstrap'
import {Link} from 'react-router'
import moment from 'moment'

import API from '../../api'
import Breadcrumbs from '../../components/Breadcrumbs'
import {FormField} from '../../components/FormField'

const atmosphereStyle = {
	fontSize: '2rem',
	display: 'inline-block',
	marginTop: '-4px'
}

const atmosphereIcons = {
	'POSITIVE': "👍",
	'NEUTRAL': "😐",
	'NEGATIVE': "👎",
}

export default class ReportShow extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			report: {},
		}
	}

	componentDidMount() {
		API.query(`
			report(id:${this.props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				reportText, nextSteps
				location { id, name }
				author { id, name }
				attendees { id, name }
				poams { id, shortName, longName }

			}
		`).then(data => this.setState({report: data.report}))
	}

	render() {
		let {report} = this.state
		let breadcrumbName = report.intent || 'Report'
		let breadcrumbUrl = '/reports/' + (report.id || this.props.params.id)

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [breadcrumbName, breadcrumbUrl]]} />

				<Form horizontal>
					<fieldset>
						<legend>Report #{report.id}</legend>
						<FormField label="Subject" type="static" value={report.intent} />
						<FormField label="Date 📆" type="static" value={moment(+report.engagementDate).format("L LT")} />
						<FormField label="Location 📍" type="static" value={report.location && report.location.name} />
						<FormField label="Atmospherics" type="static">
							<span style={atmosphereStyle}>{atmosphereIcons[report.atmosphere]}</span>
							{report.atmosphereDetails && " " + report.atmosphereDetails}
						</FormField>
						<FormField label="Report author" type="static">
							{report.author &&
								<Link to={"/users/" + report.author.id}>{report.author.name}</Link>
							}
						</FormField>
					</fieldset>

					<fieldset>
						<legend>Meeting attendees</legend>
						{(report.attendees && report.attendees.map(person =>
							person.name
						)) || "This report does not specify any attendees."}
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>
						{(report.poams && report.poams.map(poam =>
							poam.longName
						)) || "This report does not specify any milestones."}
					</fieldset>

					<fieldset>
						<legend>Meeting discussion</legend>

						<h5>Key outcomes</h5>
						<div dangerouslySetInnerHTML={{__html: report.reportText}} />

						<h5>Next steps</h5>
						<div dangerouslySetInnerHTML={{__html: report.nextSteps}} />
					</fieldset>
				</Form>
			</div>
		)
	}
}
