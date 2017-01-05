import React from 'react'
import Page from 'components/Page'
import {Table, Button} from 'react-bootstrap'
import moment from 'moment'

import {Report, Person, Poam, Position, Organization, Location} from 'models'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'

import API from 'api'

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

const commentFormStyle = {
	marginTop: '50px',
}

export default class ReportShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			report: new Report({id: props.params.id}),

			newComment: {
				text: '',
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

				poams { id, shortName, longName, responsibleOrg { id, name} }

				comments {
					id, text, createdAt, updatedAt
					author { id, name, rank }
				}
				advisorOrg { id, name }
				principalOrg {id, name}
			}
		`).then(data => this.setState({report: new Report(data.report)}))
	}

	render() {
		let report = this.state.report

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [report.intent || 'Report', Report.pathFor(report)]]} />

				<Form static formFor={report} horizontal>
					<fieldset>
						<legend>Report #{report.id}</legend>

						<Form.Field id="intent" label="Subject" />
						<Form.Field id="engagementDate" label="Date 📆" getter={date => moment(date).format("L")} />
						<Form.Field id="location" label="Location 📍">
							{report.location && <LinkTo location={report.location} />}
						</Form.Field>
						<Form.Field id="atmosphere" label="Atmospherics">
							<span style={atmosphereIconStyle}>{atmosphereIcons[report.atmosphere]}</span>
							{report.atmosphereDetails}
						</Form.Field>
						<Form.Field id="author" label="Report author">
							<LinkTo person={report.author} />
						</Form.Field>
						<Form.Field id="advisorOrg" label="Advisor Org">
							<LinkTo organization={report.advisorOrg} />
						</Form.Field>
						<Form.Field id="principalOrg" label="Principal Org">
							<LinkTo organization={report.principalOrg} />
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
								{Person.map(report.attendees, person =>
									<tr key={person.id}>
										<td><LinkTo person={person} /></td>
										<td><LinkTo position={person.position} /></td>
									</tr>
								)}
							</tbody>
						</Table>
					</fieldset>

					<fieldset>
						<legend>Plan of Action and Milestones / Pillars</legend>

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Organization</th>
								</tr>
							</thead>

							<tbody>
								{Poam.map(report.poams, poam =>
									<tr key={poam.id}>
										<td><LinkTo poam={poam} /></td>
										<td><LinkTo organization={poam.responsibleOrg} /></td>
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

					<fieldset>
						<legend>Comments</legend>

						{report.comments.map(comment =>
							<p key={comment.id}>
								<LinkTo person={comment.author} />
								<small>said</small>
								"{comment.text}"
							</p>
						)}

						{!report.comments.length && "There are no comments yet."}

						<Form formFor={this.state.newComment} horizontal style={commentFormStyle}>
							<Form.Field id="text" placeholder="Type a comment here" label="">
								<Form.Field.ExtraCol>
									<Button bsStyle="primary" type="submit">Save comment</Button>
								</Form.Field.ExtraCol>
							</Form.Field>
						</Form>
					</fieldset>
				</Form>
			</div>
		)
	}
}
