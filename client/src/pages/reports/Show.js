import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import moment from 'moment'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'


const atmosphereIconStyle = {
	fontSize: '2rem',
	display: 'inline-block',
	marginTop: '-4px',
	marginRight: '1rem',
}

const atmosphereIcons = {
	'POSITIVE': "👍",
	'NEUTRAL': "😐",
	'NEGATIVE': "👎",
}

export default class ReportShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			report: {id: props.params.id},
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
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
		let report = this.state.report
		let breadcrumbName = report.intent || 'Report'
		let breadcrumbUrl = `/reports/${report.id}`

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [breadcrumbName, breadcrumbUrl]]} />

				<Form formFor={report} horizontal>
					<fieldset>
						<legend>Report #{report.id}</legend>

						<Form.Field id="intent" label="Subject" type="static" />
						<Form.Field id="engagementDate" label="Date 📆" type="static" value={moment(report.engagementDate).format("L")} />
						<Form.Field id="location" label="Location 📍" type="static" value={report.location && report.location.name} />
						<Form.Field id="atmosphere" label="Atmospherics" type="static">
							<span style={atmosphereIconStyle}>{atmosphereIcons[report.atmosphere]}</span>
							{report.atmosphereDetails}
						</Form.Field>
						<Form.Field id="author" label="Report author" type="static">
							{report.author &&
								<Link to={"/people/" + report.author.id}>{report.author.name}</Link>
							}
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Meeting attendees</legend>

						<ul>
							{(report.attendees && report.attendees.map(person =>
								<li key={person.id}>
									<Link to={"/people/" + person.id}>
										{person.name}
									</Link>
								</li>
							)) || "This report does not specify any attendees."}
						</ul>
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>

						<ul>
							{(report.poams && report.poams.map(poam =>
								<li key={poam.id}>
									<Link to={"/milestones/" + poam.id}>
										{poam.shortName} {poam.longName}
									</Link>
								</li>
							)) || "This report does not specify any milestones."}
						</ul>
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
