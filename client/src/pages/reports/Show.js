import React from 'react'
import Page from 'components/Page'
import {Table, Button, Col, DropdownButton, MenuItem, Modal} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import moment from 'moment'

import {Report, Person, Poam, Comment} from 'models'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import History from 'components/History'

import API from 'api'

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
			newComment: new Comment(),
            approvalComment: new Comment(),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				keyOutcomesSummary, keyOutcomes, nextStepsSummary, reportText, nextSteps

				state

				location { id, name }
				author {
					id, name
					position {
						organization {
							name
							approvalSteps {
								id
								approverGroup {
									id, name
									members { id, name, rank }
								}
							}
						}
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
				advisorOrg { id, name }

				approvalStatus {
					type, createdAt
					step { id ,
						approverGroup {
							id, name,
							members { id, name }
						}
					},
					person { id, name, rank}
				}

				approvalStep {
					approverGroup {
						members { id }
					}
				}
			}
		`).then(data => this.setState({report: new Report(data.report)}))
	}

	render() {
		let {report} = this.state
		let {currentUser} = this.context.app.state

		let canApprove = report.isPending() && (currentUser.isAdmin() ||
			report.approvalStep.approverGroup.members.find(member => member.id === currentUser.id))

		//Authors can approve in draft mode or Pending Mode
		let canEdit = (report.isDraft() || report.isPending()) && (currentUser.id === report.author.id)
		//Approvers can edit.
		canEdit = canEdit || canApprove

		//Only the author can submit when report is in Draft.
		let canSubmit = report.isDraft() && (currentUser.id === report.author.id)

		//Anbody can email a report as long as it's not in draft.
		let canEmail = !report.isDraft();

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [report.intent || 'Report #' + report.id, Report.pathFor(report)]]} />


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

				<div className="pull-right">
					<DropdownButton bsStyle="primary" title="Actions" id="actions"
							className="pull-right" onSelect={this.actionSelect}>
						{canEdit && <MenuItem eventKey="edit" >Edit Report</MenuItem>}
						{canSubmit && <MenuItem eventKey="submit">Submit</MenuItem>}
						{canEmail && <MenuItem eventKey="email" className="todo" >Email Report</MenuItem>}
					</DropdownButton>
				</div>

				<Form static formFor={report} horizontal>
					{this.state.error &&
						<fieldset className="text-danger">
							<p>There was a problem saving this report.</p>
							<p>{this.state.error}</p>
						</fieldset>
					}

					<fieldset>
						<legend>Report #{report.id}</legend>

						<Form.Field id="intent" label="Subject" />
						<Form.Field id="engagementDate" label="Date 📆" getter={date => moment(date).format("L")} />
						<Form.Field id="location" label="Location 📍">
							{report.location && <LinkTo location={report.location} />}
						</Form.Field>
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
						<span>{report.keyOutcomesSummary}</span>
						<div dangerouslySetInnerHTML={{__html: report.keyOutcomes}} />

						<h5>Next steps</h5>
						<span>{report.nextStepsSummary}</span>
						<div dangerouslySetInnerHTML={{__html: report.nextSteps}} />

						<h5>Report Details</h5>
						<div dangerouslySetInnerHTML={{__html: report.reportText}} />

					</fieldset>

					{report.isPending() &&
						<fieldset>
							<a name="approvals" />
							<legend>Approvals</legend>

							{report.approvalStatus.map(action =>
								this.renderApprovalAction(action)
							)}

							{canApprove &&
								<Form.Field id="author" style={Object.assign({width:"200%"},commentFormCss)} type="text" className="pull-left" placeholder="Type a comment here" getter={this.getApprovalComment} onChange={this.onChangeComment}>
								</Form.Field>
							}
							{canApprove &&
								<div className="pull-right" style={commentFormCss}>
									<Button bsStyle="danger" style={approvalButtonCss} onClick={this.rejectReport}>Reject with comment</Button>
									<Button bsStyle="warning" style={approvalButtonCss} onClick={this.actionSelect.bind(this, "edit")} >Edit report</Button>
									<Button bsStyle="primary" style={approvalButtonCss} onClick={this.approveReport}>Approve</Button>
								</div>
							}
						</fieldset>
					}

					{canSubmit &&
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
					}

					<fieldset>
						<legend>Comments</legend>

						{report.comments.map(comment => {
							let createdAt = moment(comment.createAt)
							return (
								<p key={comment.id}>
									<LinkTo person={comment.author} />
									<span title={createdAt.format('L LT')}> {createdAt.fromNow()}: </span>
									"{comment.text}"
								</p>
							)
						})}

						{!report.comments.length && "There are no comments yet."}

						<Form formFor={this.state.newComment} horizontal style={commentFormCss} onSubmit={this.submitComment} onChange={this.onChange}>
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

	@autobind
	submitDraft() {
		API.send(`/api/reports/${this.state.report.id}/submit`).then(this.updateReport, this.handleError)
	}

	@autobind
	submitComment(){
			API.send(`/api/reports/${this.state.report.id}/comments`,this.state.newComment).then(this.updateReport, this.handleError)
	}

	@autobind
	rejectReport() {
		if (this.state.approvalComment.text.length === 0){
			this.handleError({error:"Please include a comment when rejecting a report."})
			return
		}

		API.send(`/api/reports/${this.state.report.id}/reject`, this.state.approvalComment).then(this.updateReport, this.handleError)
	}

	@autobind
	approveReport() {
		API.send(`/api/reports/${this.state.report.id}/approve`).then(this.updateReport, this.handleError)
	}

	@autobind
	onChange() {
		let report = this.state.report
		this.setState({report})
	}

	@autobind
	getApprovalComment(){
		return this.state.approvalComment.text
	}

	@autobind
	onChangeComment(value) {
		let approvalComment = this.state.approvalComment
		approvalComment.text=value.target.value
		this.setState({approvalComment})
	}

	@autobind
	updateReport(json) {
		this.fetchData(this.props)
		window.scrollTo(0, 0)
	}

	@autobind
	handleError(response) {
		this.setState({error: response.error})
		window.scrollTo(0, 0)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "edit") {
			History.push(`/reports/${this.state.report.id}/edit`);
		} else if (eventKey === "submit" ) {
			this.submitDraft()
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
	}

	@autobind
	renderApprovalAction(action) {
		let group = action.step.approverGroup
		return <div key={action.step.id}>
			<Button onClick={this.showApproversModal.bind(this, group)}>
				{group.name}
			</Button>
			<Modal show={group.showModal} onHide={this.closeApproversModal.bind(this, group)}>
				<Modal.Header closeButton>
					<Modal.Title>Approvers for {group.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ul>
					{group.members.map(p =>
						<li key={p.id}>{p.name} - {p.emailAddress}</li>
					)}
					</ul>
				</Modal.Body>
			</Modal>
	 	{action.type ?
				<span> {action.type} by {action.person.name} <small>{moment(action.createdAt).format("L")}</small></span>
				:
				<span className="text-danger"> Pending</span>
			}
		</div>
	}

	@autobind
	showApproversModal(approverGroup) {
		approverGroup.showModal = true
		this.setState(this.state)
	}

	@autobind
	closeApproversModal(approverGroup) {
		approverGroup.showModal = false
		this.setState(this.state)
	}
}
