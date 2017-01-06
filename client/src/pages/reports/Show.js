import React from 'react'
import Page from 'components/Page'
import {Table, Button, Col} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import moment from 'moment'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'

import API from 'api'
import {Report, Person, Poam} from 'models'

const atmosphereIconCss = {
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

const commentFormCss = {
	marginTop: '50px',
}

const approvalButtonCss = {
	marginLeft: '15px',
}

export default class ReportShow extends Page {
	static contextTypes = {
		app: React.PropTypes.object,
	}

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

				state

				location { id, name }
				author {
					id, name
					position {
						organization { name }
					}
				}

				attendees {
					id, name, role
					position { id, name }
				}
				primaryAdvisor { id }
				primaryPrincipal { id }

				poams { id, shortName, longName, responsibleOrg { id, name} }

				comments {
					id, text, createdAt, updatedAt
					author { id, name, rank }
				}

				principalOrg { id, name }
				advisorOrg {
					id, name
					approvalSteps {
						id
						approverGroup {
							id, name
							members { id, name, rank }
						}
					}
				}

				approvalStatus {
					type, createdAt
					step {
						id
						approverGroup {
							id, members { id }
						}
					}
				}
			}
		`).then(data => this.setState({report: new Report(data.report)}))
	}

	render() {
		let {report} = this.state
		let {currentUser} = this.context.app.state

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [report.intent || 'Report #' + report.id, Report.pathFor(report)]]} />

				<Form static formFor={report} horizontal>
					{this.state.error &&
						<fieldset className="text-danger">
							<p>There was a problem saving this report.</p>
							<p>{this.state.error}</p>
						</fieldset>
					}

					{report.isDraft() &&
						<fieldset style={{textAlign: 'center'}}>
							<h4 className="text-danger">This report is in DRAFT state and hasn't been submitted.</h4>
							<p>You can review the draft below to make sure all the details are correct.</p>
						</fieldset>
					}

					{report.isPending() &&
						<fieldset style={{textAlign: 'center'}}>
							<h4 className="text-danger">This report is PENDING approvals.</h4>
							<p>It won't be available in the ANET database until your <a href="#approvals">approval organization</a> marks it as approved.</p>
						</fieldset>
					}

					<fieldset>
						<legend>Report #{report.id}</legend>

						<Form.Field id="intent" label="Subject" />
						<Form.Field id="engagementDate" label="Date 📆" getter={date => moment(date).format("L")} />
						<Form.Field id="location" label="Location 📍" getter={location => location && location.name} />
						<Form.Field id="atmosphere" label="Atmospherics">
							<span style={atmosphereIconCss}>{atmosphereIcons[report.atmosphere]}</span>
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
									<th>Primary</th>
									<th>Name</th>
									<th>Type</th>
									<th>Position</th>
								</tr>
							</thead>

							<tbody>
								{Person.map(report.attendees, person =>
									<tr key={person.id}>
										<td>
											{(Person.isEqual(report.primaryAdvisor, person) || Person.isEqual(report.primaryPrincipal, person)) &&
												"⭐️"
											}
										</td>
										<td><LinkTo person={person} /></td>
										<td>{person.role}</td>
										<td><LinkTo position={person.position} /></td>
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

					{report.isPending() &&
						<fieldset>
							<a name="approvals" />
							<legend>Approvals</legend>

							{report.advisorOrg.approvalSteps.map(step =>
								<div key={step.id}>
									{<LinkTo person={step.approverGroup.members[0]} /> || step.approverGroup.name}
									{report.approvalStatus.find(thisStep => step.id === thisStep.id) ?
										<span> approved <small>{step.createdAt}</small></span>
										:
										<span className="text-danger"> Pending</span>
									}
								</div>
							)}

							{currentUser.isSuperUserForOrg(report.advisorOrg) &&
								<div className="pull-right">
									<Button bsStyle="danger" style={approvalButtonCss} onClick={this.rejectReport}>Reject</Button>
									<Button bsStyle="warning" style={approvalButtonCss}>Edit report</Button>
									<Button bsStyle="primary" style={approvalButtonCss} onClick={this.approveReport}>Approve</Button>
								</div>
							}
						</fieldset>
					}

					{report.isDraft() ?
						<fieldset>
							<Col md={9}>
								<p>
									By pressing submit, this report will be sent to
									<strong> {Object.get(report, 'author.position.organization.name') || 'your organization approver'} </strong>
									to go through the approval workflow.
								</p>
							</Col>

							<Col md={3}>
								<Button type="submit" bsStyle="primary" bsSize="large" onClick={this.submitDraft}>
									Submit report
								</Button>
							</Col>
						</fieldset>
						:
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

							<Form formFor={this.state.newComment} horizontal style={commentFormCss}>
								<Form.Field id="text" placeholder="Type a comment here" label="">
									<Form.Field.ExtraCol>
										<Button bsStyle="primary" type="submit">Save comment</Button>
									</Form.Field.ExtraCol>
								</Form.Field>
							</Form>
						</fieldset>
					}
				</Form>
			</div>
		)
	}

	@autobind
	submitDraft() {
		API.send(`/api/reports/${this.state.report.id}/submit`).then(this.updateReport, this.handleError)
	}

	@autobind
	rejectReport() {
		API.send(`/api/reports/${this.state.report.id}/reject`, {text: "TODO"}).then(this.updateReport, this.handleError)
	}

	@autobind
	approveReport() {
		API.send(`/api/reports/${this.state.report.id}/approve`).then(this.updateReport, this.handleError)
	}

	@autobind
	updateReport(json) {
		let {report} = this.state
		report.setState(json)
		this.setState({report})
	}

	@autobind
	handleError(response) {
		this.setState({error: response.error})
		window.scrollTo(0, 0)
	}
}
