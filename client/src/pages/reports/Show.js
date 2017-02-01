import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Alert, Table, Button, Col, DropdownButton, MenuItem, Modal, Checkbox} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import moment from 'moment'

import {Report, Person, Poam, Comment} from 'models'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import Messages from 'components/Messages'
import LinkTo from 'components/LinkTo'
import History from 'components/History'
import Autocomplete from 'components/Autocomplete'

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
		app: PropTypes.object,
	}

	constructor(props) {
		super(props)
		this.state = {
			report: new Report({id: props.params.id}),
			newComment: new Comment(),
			approvalComment: new Comment(),
			showEmailModal: false,
			email: { toAddresses: "", comment: "" , errors: null}
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
					id, name, role, primary
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
						approvers { id, name, person { id, name } }
					},
					person { id, name, rank}
				}

				approvalStep { name, approvers { id } }
			}
		`).then(data => {
			this.setState({report: new Report(data.report)})
		})
	}

	render() {
		let {report} = this.state
		let {currentUser} = this.context.app.state

		let canApprove = report.isPending() && currentUser.position &&
			report.approvalStep.approvers.find(member => member.id === currentUser.position.id)

		//Authors can edit in draft mode, rejected mode, or Pending Mode
		let canEdit = (report.isDraft() || report.isPending() || report.isRejected()) && (currentUser.id === report.author.id)
		//Approvers can edit.
		canEdit = canEdit || canApprove

		//Only the author can submit when report is in Draft or rejected
		let canSubmit = (report.isDraft() || report.isRejected()) && (currentUser.id === report.author.id)

		//Anbody can email a report as long as it's not in draft.
		let canEmail = !report.isDraft();

		let errors = report.isDraft() && report.validateForSubmit();

		return (
			<div>
				<Breadcrumbs items={[['Reports', '/reports'], [report.intent || 'Report #' + report.id, Report.pathFor(report)]]} />

				<Messages error={this.state.error} success={this.state.success} />

				{report.isRejected() &&
					<fieldset style={{textAlign: 'center' }}>
						<h4 className="text-danger">This report was REJECTED. </h4>
						<p>You can review the comments below, fix the report and re-submit</p>
					</fieldset>
				}

				{report.isDraft() &&
					<fieldset style={{textAlign: 'center'}}>
						<h4 className="text-danger">This report is in DRAFT state and hasn't been submitted.</h4>
						<p>You can review the draft below to make sure all the details are correct.</p>
						<div style={{textAlign: 'left'}}>
							{errors && errors.length > 0 &&
								this.renderValidationErrors(errors)
							}
						</div>
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
						{canSubmit && errors.length === 0 && <MenuItem eventKey="submit">Submit</MenuItem>}
						{canEmail && <MenuItem eventKey="email" onClick={this.toggleEmailModal}>Email Report</MenuItem>}
					</DropdownButton>
				</div>

				{this.renderEmailModal()}

				<Form static formFor={report} horizontal>
					<fieldset>
						<legend>Report #{report.id}</legend>

						<Form.Field id="intent" label="Purpose" />
						<Form.Field id="engagementDate" label="Date 📆" getter={date => date && moment(date).format("D MMM YYYY")} />
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
									<th style={{textAlign: 'center'}}>Primary</th>
									<th>Name</th>
									<th>Position</th>
								</tr>
							</thead>

							<tbody>
								{Person.map(report.attendees, person =>
									<tr key={person.id}>
										<td className="primary-attendee">
											{person.primary && <Checkbox readOnly checked />}
										</td>
										<td>
											<img src={person.iconUrl()} alt={person.role} height={20} width={20} className="person-icon" />
											<LinkTo person={person} />
										</td>
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
								<Form.Field id="author" label=""
										style={commentFormCss}
										componentClass="textarea"
										placeholder="Type a comment here"
										getter={this.getApprovalComment}
										onChange={this.onChangeComment} >
								</Form.Field>
							}
							{canApprove &&
								<div style={commentFormCss}>
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
									disabled={errors && errors.length > 0}>
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

						<Form formFor={this.state.newComment} horizontal style={commentFormCss} onSubmit={this.submitComment} onChange={this.onChange} submitText={false}>
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
	renderEmailModal() {
		let email = this.state.email
		return <Modal show={this.state.showEmailModal} onHide={this.toggleEmailModal} >
			<Modal.Header closeButton>
				<Modal.Title>Email Report</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{email.errors &&
					<Alert bsStyle="danger">{email.errors}</Alert>
				}
				<Form formFor={email} onChange={this.onChange} submitText={false} >
					<Form.Field id="to" label="To:" >
						<Autocomplete valueKey="name"
							placeholder="Select the person to email"
							url="/api/people/search"
							queryParams={{role: "ADVISOR"}}
						/>
					</Form.Field>
					<Form.Field componentClass="textarea" id="comment" />
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button bsStyle="primary" onClick={this.emailReport}>Send Email</Button>
			</Modal.Footer>
		</Modal>
	}

	@autobind
	toggleEmailModal() {
		this.setState({showEmailModal : !this.state.showEmailModal});
	}

	@autobind
	emailReport() {
		let email = this.state.email;
		if (!email.to) {
			email.errors = "You must select a person to send this to"
			this.setState({email})
			return;
		}

		email = {
			toAddresses: [email.to.emailAddress],
			context: {comment: email.comment },
			subject: "Sharing an email from ANET"
		}
		API.send(`/api/reports/${this.state.report.id}/email`, email).then (() =>
			this.setState({
				success: "Email successfully sent",
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
			this.setState({success:"Successfully submited report"})
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
			this.handleError({message:"Please include a comment when rejecting a report."})
			return
		}

		this.state.approvalComment.text = "REJECTED: " + this.state.approvalComment.text
		API.send(`/api/reports/${this.state.report.id}/reject`, this.state.approvalComment).then(data => {
			this.updateReport()
			this.setState({success:"Successfully rejected report"})
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
			this.updateReport()
			this.setState({error:null})
			this.setState({success:"Successfully subbmited report"})
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
		this.setState({error: response})
		window.scrollTo(0, 0)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "edit") {
			History.push(`/reports/${this.state.report.id}/edit`);
		} else if (eventKey === "submit" ) {
			this.submitDraft()
		} else if (eventKey === "email" ) {
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
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
				<span> {action.type} by {action.person.name} <small>{moment(action.createdAt).format("D MMM YYYY")}</small></span>
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
