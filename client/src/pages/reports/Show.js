import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Alert, Table, Button, Col, Modal, Checkbox} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import moment from 'moment'
import utils from 'utils'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import Messages from 'components/Messages'
import LinkTo from 'components/LinkTo'

import API from 'api'
import {Report, Person, Poam, Comment, Position} from 'models'

export default class ReportShow extends Page {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	static modelName = 'Report'

	constructor(props) {
		super(props)
		this.state = {
			report: new Report({id: props.params.id}),
			newComment: new Comment(),
			approvalComment: new Comment(),
			showEmailModal: false,
			email: { toAddresses: '', comment: '' , errors: null}
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				keyOutcomes, reportText, nextSteps, cancelledReason

				state

				location { id, name }
				author {
					id, name, rank,
					position {
						organization {
							shortName, longName
							approvalSteps {
								id, name,
								approvers {
									id, name,
									person { id, name rank }
								}
							}
						}
					}
				}

				attendees {
					id, name, role, primary, rank,
					position { id, name }
				}
				primaryAdvisor { id }
				primaryPrincipal { id }

				poams { id, shortName, longName, responsibleOrg { id, shortName} }

				comments {
					id, text, createdAt, updatedAt
					author { id, name, rank }
				}

				principalOrg { id, shortName, longName }
				advisorOrg { id, shortName, longName }

				approvalStatus {
					type, createdAt
					step { id , name
						approvers { id, name, person { id, name, rank } }
					},
					person { id, name, rank}
				}

				approvalStep { name, approvers { id }, nextStepId }
			}
		`).then(data => {
			this.setState({report: new Report(data.report)})
		})
	}

	render() {
		let {report} = this.state
		let {currentUser} = this.context

		let canApprove = report.isPending() && currentUser.position &&
			report.approvalStep.approvers.find(member => Position.isEqual(member, currentUser.position))
		//Authors can edit in draft mode, rejected mode, or Pending Mode
		let canEdit = (report.isDraft() || report.isPending() || report.isRejected()) && Person.isEqual(currentUser, report.author)
		//Approvers can edit.
		canEdit = canEdit || canApprove

		//Only the author can submit when report is in Draft or rejected
		let canSubmit = (report.isDraft() || report.isRejected()) && Person.isEqual(currentUser, report.author)

		//Anbody can email a report as long as it's not in draft.
		let canEmail = !report.isDraft()

		let errors = report.isDraft() && report.validateForSubmit()

		let isCancelled = report.cancelledReason ? true : false

		return (
			<div className="report-show">
				<Breadcrumbs items={[['Reports', '/reports'], ['Report #' + report.id, Report.pathFor(report)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				{report.isRejected() &&
					<Fieldset style={{textAlign: 'center' }}>
						<h4 className="text-danger">This report was REJECTED. </h4>
						<p>You can review the comments below, fix the report and re-submit</p>
					</Fieldset>
				}

				{report.isDraft() &&
					<Fieldset style={{textAlign: 'center'}}>
						<h4 className="text-danger">This report is in DRAFT state and hasn't been submitted.</h4>
						<p>You can review the draft below to make sure all the details are correct.</p>
						<div style={{textAlign: 'left'}}>
							{errors && errors.length > 0 &&
								this.renderValidationErrors(errors)
							}
						</div>
					</Fieldset>
				}

				{report.isPending() &&
					<Fieldset style={{textAlign: 'center'}}>
						<h4 className="text-danger">This report is PENDING approvals.</h4>
						<p>It won't be available in the ANET database until your <a href="#approvals">approval organization</a> marks it as approved.</p>
					</Fieldset>
				}

				{this.renderEmailModal()}

				<Form static formFor={report} horizontal>
					<Fieldset title={`Report #${report.id}`} className="show-report-overview" action={<div>
						{canEmail && <Button onClick={this.toggleEmailModal}>Email report</Button>}
						{canEdit && <LinkTo report={report} edit button="primary">Edit</LinkTo>}
						{canSubmit && errors.length === 0 && <Button bsStyle="primary" onClick={this.submitDraft}>Submit</Button>}
					</div>
					}>

						<Form.Field id="intent" label="Summary" >
							<p><strong>Meeting goal:</strong> {report.intent}</p>
							{report.keyOutcomes && <p><span><strong>Key outcomes:</strong> {report.keyOutcomes}&nbsp;</span></p>}
							<p><strong>Next steps:</strong> {report.nextSteps}</p>
						</Form.Field>

						<Form.Field id="engagementDate" label="Date" getter={date => date && moment(date).format('D MMMM, YYYY')} />

						<Form.Field id="location" label="Location">
							{report.location && <LinkTo location={report.location} />}
						</Form.Field>

						{!isCancelled &&
							<Form.Field id="atmosphere" label="Atmospherics">
								{utils.sentenceCase(report.atmosphere)}
								{report.atmosphereDetails && ` – ${report.atmosphereDetails}`}
							</Form.Field>
						}
						{isCancelled &&
							<Form.Field id="cancelledReason" label="Cancelled Reason">
								{utils.sentenceCase(report.cancelledReason)}
							</Form.Field>
						}
						<Form.Field id="author" label="Report author">
							<LinkTo person={report.author} />
						</Form.Field>
						<Form.Field id="advisorOrg" label="Advisor Org">
							<LinkTo organization={report.advisorOrg} />
						</Form.Field>
						<Form.Field id="principalOrg" label="Principal Org">
							<LinkTo organization={report.principalOrg} />
						</Form.Field>
					</Fieldset>

					<Fieldset title="Meeting attendees">
						<Table condensed className="borderless">
							<thead>
								<tr>
									<th style={{textAlign: 'center'}}>Primary</th>
									<th>Name</th>
									<th>Position</th>
								</tr>
							</thead>

							<tbody>
								{Person.map(report.attendees.filter(p => p.role === "ADVISOR"), person =>
									this.renderAttendeeRow(person)
								)}
								<tr><td colSpan={3}><hr className="attendee-divider" /></td></tr>
								{Person.map(report.attendees.filter(p => p.role === "PRINCIPAL"), person =>
									this.renderAttendeeRow(person)
								)}
							</tbody>
						</Table>
					</Fieldset>

					<Fieldset title="Plan of Action and Milestones / Pillars">
						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Organization</th>
								</tr>
							</thead>

							<tbody>
								{Poam.map(report.poams, (poam, idx) =>
									<tr key={poam.id} id={"poam_" + idx}>
										<td className="poamName" ><LinkTo poam={poam} >{poam.shortName} - {poam.longName}</LinkTo></td>
										<td className="poamOrg" ><LinkTo organization={poam.responsibleOrg} /></td>
									</tr>
								)}
							</tbody>
						</Table>
					</Fieldset>

					{report.reportText &&
						<Fieldset title="Meeting discussion">
							<div dangerouslySetInnerHTML={{__html: report.reportText}} />
						</Fieldset>
					}

					{report.isPending() && this.renderApprovals()}

					{canSubmit &&
						<Fieldset>
							<Col md={9}>
								{(errors && errors.length > 0) ?
									this.renderValidationErrors(errors)
									:
										<p>
											By pressing submit, this report will be sent to
											<strong> {Object.get(report, 'author.position.organization.name') || 'your organization approver'} </strong>
											to go through the approval workflow.
										</p>
								}
							</Col>

							<Col md={3}>
								<Button type="submit" bsStyle="primary" bsSize="large"
									onClick={this.submitDraft}
									disabled={errors && errors.length > 0}
									id="submitReportButton">
									Submit report
								</Button>
							</Col>
						</Fieldset>
					}

					<Fieldset className="report-sub-form" title="Comments">
						{report.comments.map(comment => {
							let createdAt = moment(comment.createdAt)
							return (
								<p key={comment.id}>
									<LinkTo person={comment.author} />
									<span title={createdAt.format('L LT')}> {createdAt.fromNow()}: </span>
									"{comment.text}"
								</p>
							)
						})}

						{!report.comments.length && <p>There are no comments yet.</p>}

						<Form formFor={this.state.newComment} horizontal onSubmit={this.submitComment} submitText={false}>
							<Form.Field id="text" placeholder="Type a comment here" label="Add a comment" componentClass="textarea" />

							<div className="right-button">
								<Button bsStyle="primary" type="submit">Save comment</Button>
							</div>
						</Form>
					</Fieldset>

					{canApprove && this.renderApprovalForm()}
				</Form>
			</div>
		)
	}

	@autobind
	renderApprovalForm() {
		return <Fieldset className="report-sub-form" title="Report approval">
			<h5>You can approve, reject, or edit this report</h5>

			<Form.Field
				id="approvalComment"
				componentClass="textarea"
				label="Approval comment"
				placeholder="Type a comment here; required for a rejection"
				getter={this.getApprovalComment}
				onChange={this.onChangeComment}
			/>

			<Button bsStyle="warning" onClick={this.rejectReport}>Reject with comment</Button>
			<div className="right-button">
				<LinkTo report={this.state.report} edit button>Edit report</LinkTo>
				<Button bsStyle="primary" onClick={this.approveReport}><strong>Approve</strong></Button>
			</div>
		</Fieldset>
	}

	@autobind
	renderApprovals(canApprove) {
		let report = this.state.report
		return <Fieldset id="approvals" title="Approvals">
			{report.approvalStatus.map(action =>
				this.renderApprovalAction(action)
			)}
		</Fieldset>
	}

	@autobind
	renderAttendeeRow(person) {
		return <tr key={person.id}>
			<td className="primary-attendee">
				{person.primary && <Checkbox readOnly checked />}
			</td>
			<td>
				<img src={person.iconUrl()} alt={person.role} height={20} width={20} className="person-icon" />
				<LinkTo person={person} />
			</td>
			<td><LinkTo position={person.position} /></td>
		</tr>
	}

	@autobind
	renderEmailModal() {
		let email = this.state.email
		return <Modal show={this.state.showEmailModal} onHide={this.toggleEmailModal}>
			<Form formFor={email} onChange={this.onChange} submitText={false}>
				<Modal.Header closeButton>
					<Modal.Title>Email Report</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{email.errors &&
						<Alert bsStyle="danger">{email.errors}</Alert>
					}

					<Form.Field id="to" />
					<Form.Field id="comment" componentClass="textarea" />
				</Modal.Body>

				<Modal.Footer>
					<Button bsStyle="primary" onClick={this.emailReport}>Send Email</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	}

	@autobind
	toggleEmailModal() {
		this.setState({showEmailModal : !this.state.showEmailModal})
	}

	@autobind
	emailReport() {
		let email = this.state.email
		if (!email.to) {
			email.errors = 'You must select a person to send this to'
			this.setState({email})
			return
		}

		email = {
			toAddresses: email.to.replace(/\s/g, '').split(/[,;]/),
			comment: email.comment
		}
		API.send(`/api/reports/${this.state.report.id}/email`, email).then (() =>
			this.setState({
				success: 'Email successfully sent',
				showEmailModal: false,
				email: {}
			})
		)
	}

	@autobind
	submitDraft() {
		API.send(`/api/reports/${this.state.report.id}/submit`).then(data => {
			this.updateReport()
			this.setState({error:null})
			this.setState({success:'Successfully submited report'})
		}, data => {
			this.handleError(data)
		})
	}

	@autobind
	submitComment(event){
		API.send(`/api/reports/${this.state.report.id}/comments`,
			this.state.newComment)
		.then(data => {
			this.updateReport()
			this.setState({newComment:new Comment()})
		}, data => {
			this.setState({success:null})
			this.handleError(data)
		})

		event.stopPropagation()
		event.preventDefault()
	}

	@autobind
	rejectReport() {
		if (this.state.approvalComment.text.length === 0){
			this.setState({success:null})
			this.handleError({message:'Please include a comment when rejecting a report.'})
			return
		}

		this.state.approvalComment.text = 'REJECTED: ' + this.state.approvalComment.text
		API.send(`/api/reports/${this.state.report.id}/reject`, this.state.approvalComment).then(data => {
			this.updateReport()
			this.setState({success:'Successfully rejected report'})
			this.setState({error:null})
		}, data => {
			this.setState({success:null})
			this.handleError(data)
		})
	}

	@autobind
	approveReport() {
		let comment = (this.state.approvalComment.text.length > 0) ? this.state.approvalComment : {}
		API.send(`/api/reports/${this.state.report.id}/approve`, comment).then(data => {
			let lastApproval = (this.state.report.approvalStep.nextStepId === null)
			this.updateReport()
			let message = 'Successfully approved report.' + (lastApproval ? ' It has been added to the daily rollup' : '')
			this.setState({error:null, success: message})
		}, data => {
			this.setState({success:null})
			this.handleError(data)
		})
	}

	@autobind
	onChange() {
		let report = this.state.report
		let email = this.state.email
		this.setState({report, email})
	}

	@autobind
	getApprovalComment(){
		return this.state.approvalComment.text
	}

	@autobind
	onChangeComment(value) {
		let approvalComment = this.state.approvalComment
		approvalComment.text = value.target.value
		this.setState({approvalComment})
	}

	@autobind
	updateReport(json) {
		this.fetchData(this.props)
		window.scrollTo(0, 0)
	}

	@autobind
	handleError(response) {
		this.setState({error: response})
		window.scrollTo(0, 0)
	}

	@autobind
	renderApprovalAction(action) {
		let step = action.step
		return <div key={step.id}>
			<Button onClick={this.showApproversModal.bind(this, step)}>
				{step.name}
			</Button>
			<Modal show={step.showModal} onHide={this.closeApproversModal.bind(this, step)}>
				<Modal.Header closeButton>
					<Modal.Title>Approvers for {step.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ul>
					{step.approvers.map(p =>
						<li key={p.id}>{p.name} - {p.person && p.person.name}</li>
					)}
					</ul>
				</Modal.Body>
			</Modal>
	 	{action.type ?
				<span> {action.type} by {action.person.name} <small>{moment(action.createdAt).format('D MMM YYYY')}</small></span>
				:
				<span className="text-danger"> Pending</span>
			}
		</div>
	}

	renderValidationErrors(errors) {
		return <Alert bsStyle="danger">
			The following errors must be fixed before submitting this report
			<ul>
			{ errors.map((error,idx) =>
				<li key={idx}>{error}</li>
			)}
			</ul>
		</Alert>
	}

	@autobind
	showApproversModal(step) {
		step.showModal = true
		this.setState(this.state)
	}

	@autobind
	closeApproversModal(step) {
		step.showModal = false
		this.setState(this.state)
	}
}
