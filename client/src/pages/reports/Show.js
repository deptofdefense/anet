import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'
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
			report: {
				id: props.params.id,
				attendees: [],
				poams: [],
			},
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				reportText, nextSteps
				location { id, name }
				author { id, name }
				attendees {
					id, name
					position { id, name }
				}
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

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Position</th>
								</tr>
							</thead>

							<tbody>
								{report.attendees.map(person =>
									<tr key={person.id}>
										<td><Link to={`/people/${person.id}`}>{person.name}</Link></td>
										<td><Link to={`/positions/${person.position.id}`}>{person.position.name}</Link></td>
									</tr>
								)}
							</tbody>
						</Table>
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Organization</th>
								</tr>
							</thead>

							<tbody>
								{report.poams.map(poam =>
									<tr key={poam.id}>
										<td><Link to={`/poams/${poam.id}`}>{poam.longName}</Link></td>
										<td className="todo"><Link to={`/organizations/${poam.shortName}`}>{poam.shortName}</Link> FIXME</td>
									</tr>
								)}
							</tbody>
						</Table>
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
