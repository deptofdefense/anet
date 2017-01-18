import React, {Component, PropTypes} from 'react'
import {InputGroup, Radio, Checkbox, Table, Button, Collapse, Alert} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Form from 'components/Form'
import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import DatePicker from 'react-bootstrap-date-picker'
import RadioGroup from 'components/RadioGroup'
import PoamsSelector from 'components/PoamsSelector'
import LinkTo from 'components/LinkTo'
import History from 'components/History'

import API from 'api'
import {Report, Person} from 'models'

export default class ReportForm extends Component {
	static propTypes = {
		report: PropTypes.instanceOf(Report).isRequired,
		edit: PropTypes.bool,
		addMyself: PropTypes.bool,
	}

	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props) {
		super(props)

		this.state = {
			recents: {
				persons: [],
				locations: [],
				poams: [],
			},

			showKeyOutcomesText: false,
			showNextStepsText: false,
			showReportText: false
		}
	}

	componentDidMount() {
		API.query(/* GraphQL */`
			locations(f:recents) {
				id, name
			}
			persons(f:recents) {
				id, name, rank, role
			}
			poams(f:recents) {
				id, shortName, longName
			}
		`).then(data => {
			let newState = {
				recents: {
					locations: data.locations,
					persons: data.persons,
					poams: data.poams,
				},
			}
			this.setState(newState)
			if (this.context.app.state.currentUser)
				this.addMyself()
		})
	}

	componentWillReceiveProps() {
		if (this.props.addMyself)
			this.addMyself()
	}

	render() {
		let {report} = this.props
		let {recents, error} = this.state

		return <Form formFor={report} horizontal onChange={this.onChange} onSubmit={this.onSubmit} submitText="Save report">

			{error &&
				<Alert bsStyle="danger">
					<p>There was a problem saving this report</p>
					<p>{error}</p>
				</Alert>
			}

			<fieldset>
				<legend>Engagement Details<small>Required</small></legend>

				<Form.Field id="intent" label="Meeting purpose" placeholder="What happened?" data-focus>
					<Form.Field.ExtraCol>{250 - report.intent.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>

				<Form.Field id="engagementDate">
					<DatePicker showTodayButton placeholder="When did it happen?" dateFormat="DD/MM/YYYY">
						<InputGroup.Addon>📆</InputGroup.Addon>
					</DatePicker>
				</Form.Field>

				<Form.Field id="location" addon="📍">
					<Autocomplete valueKey="name" placeholder="Where did it happen?" url="/api/locations/search" />
				</Form.Field>

				{false && <Form.Field id="cancelled" label="">
					<Checkbox>Engagement was cancelled?</Checkbox>
				</Form.Field>}

				{!report.cancelled &&
					<Form.Field id="atmosphere">
						<RadioGroup bsSize="large">
							<Radio value="POSITIVE">👍</Radio>
							<Radio value="NEUTRAL">😐</Radio>
							<Radio value="NEGATIVE">👎</Radio>
						</RadioGroup>
					</Form.Field>
				}

				{!report.cancelled && report.atmosphere && report.atmosphere !== 'POSITIVE' &&
					<Form.Field id="atmosphereDetails" />
				}
			</fieldset>

			<fieldset>
				<legend>Meeting Attendance<small>Required</small></legend>

				<Form.Field id="attendees">
					<Autocomplete placeholder="Who was there?" url="/api/people/search" template={person =>
						<span>{person.name} {person.rank && person.rank.toUpperCase()}</span>
					} onChange={this.addAttendee} clearOnSelect={true} />

					<Table hover striped>
						<thead>
							<tr>
								<th></th>
								<th>Primary</th>
								<th>Name</th>
								<th>Type</th>
								<th>Position</th>
							</tr>
						</thead>
						<tbody>
							{Person.map(report.attendees, person =>
								<tr key={person.id}>
									<td onClick={this.removeAttendee.bind(this, person)}>
										<span style={{cursor: 'pointer'}}>⛔️</span>
									</td>

									<td onClick={this.setPrimaryAttendee.bind(this, person)}>
										<span style={{cursor: 'pointer'}}>
											{person.primary ? "⭐️" : "☆"}
										</span>
									</td>

									<td>{person.name} {person.rank && person.rank.toUpperCase()}</td>
									<td>{person.role}</td>
									<td><LinkTo position={person.position} /></td>
								</tr>
							)}
						</tbody>
					</Table>

					<Form.Field.ExtraCol className="shortcut-list">
						<h5>Shortcuts</h5>
						{Person.map(recents.persons, person =>
							<Button key={person.id} bsStyle="link" onClick={this.addAttendee.bind(this, person)}>Add {person.name}</Button>
						)}
					</Form.Field.ExtraCol>
				</Form.Field>
			</fieldset>

			<PoamsSelector poams={report.poams} shortcuts={recents.poams} onChange={this.onChange} />

			<fieldset>
				<legend>Meeting Discussion<small>Required</small></legend>
				<Form.Field id="keyOutcomesSummary">
					<Form.Field.ExtraCol>{250 - report.keyOutcomesSummary.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>
				<Button bsStyle="link" onClick={this.toggleKeyOutcomesText} >
					{this.state.showKeyOutcomesText ? "Hide" : "Add" } details to Key Outcomes
				</Button>

				<Collapse in={this.state.showKeyOutcomesText}>
					<div>
					<Form.Field id="keyOutcomes" label="" horizontal={false}>
						<TextEditor label="Key outcomes" />
					</Form.Field>
					</div>
				</Collapse>

				<Form.Field id="nextStepsSummary" >
					<Form.Field.ExtraCol>{250 - report.nextStepsSummary.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>
				<Button bsStyle="link" onClick={this.toggleNextStepsText}>
					{this.state.showNextStepsText ? "Hide" : "Add" } details to Next Steps
				</Button>
				<Collapse in={this.state.showNextStepsText}>
					<div>
						<Form.Field id="nextSteps" label="" horizontal={false} style={{marginTop: '5rem'}}>
							<TextEditor label="Next steps" />
						</Form.Field>
					</div>
				</Collapse>

				<Button bsStyle="link" onClick={this.toggleReportText} >
					{this.state.showReportText ? "Hide" : "Add" } additional report details
				</Button>
				<Collapse in={this.state.showReportText}>
					<div>
						<Form.Field id="reportText" label="" horizontal={false}>
							<TextEditor label="Report Details" />
						</Form.Field>
					</div>
				</Collapse>

			</fieldset>
		</Form>
	}

	@autobind
	toggleKeyOutcomesText() {
		this.setState({showKeyOutcomesText: !this.state.showKeyOutcomesText})
	}

	@autobind
	toggleNextStepsText() {
		this.setState({showNextStepsText: !this.state.showNextStepsText})
	}

	@autobind
	toggleReportText() {
		this.setState({showReportText: !this.state.showReportText})
	}

	@autobind
	addAttendee(newAttendee) {
		if (!newAttendee || !newAttendee.id)
			return

		let report = this.props.report
		let attendees = report.attendees

		if (attendees.find(attendee => attendee.id === newAttendee.id))
			return

		let person = new Person(newAttendee)
		person.primary = false

		if (!attendees.find(attendee => attendee.role === person.role && attendee.primary))
			person.primary = true

		attendees.push(person)
		this.onChange()
	}

	@autobind
	removeAttendee(oldAttendee) {
		let report = this.props.report
		let attendees = report.attendees
		let index = attendees.findIndex(attendee => Person.isEqual(attendee, oldAttendee))

		if (index !== -1) {
			let person = attendees[index]
			attendees.splice(index, 1)

			if (person.primary) {
				let nextPerson = attendees.find(nextPerson => nextPerson.role === person.role)
				if (nextPerson)
					nextPerson.primary = true
			}

			this.onChange()
		}
	}

	@autobind
	setPrimaryAttendee(person) {
		let report = this.props.report
		let attendees = report.attendees

		attendees.forEach(nextPerson => {
			if (nextPerson.role === person.role)
				nextPerson.primary = false
			if (Person.isEqual(nextPerson, person))
				nextPerson.primary = true
		})

		this.onChange()
	}

	@autobind
	addMyself() {
		let {currentUser} = this.context.app.state
		this.addAttendee(currentUser)
		this.setPrimaryAttendee(currentUser)
	}

	@autobind
	onChange() {
		let report = this.state.report
		this.setState({report})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let report = this.props.report

		if(report.primaryAdvisor) { report.attendees.find(a => a.id === report.primaryAdvisor.id).isPrimary = true }
		if(report.primaryPrincipal) { report.attendees.find(a => a.id === report.primaryPrincipal.id).isPrimary = true }

		delete report.primaryPrincipal
		delete report.primaryAdvisor
		delete report.cancelled

		let url = `/api/reports/${this.props.edit ? 'update' : 'new'}`
		API.send(url, report)
			.then(response => {
				History.push(Report.pathFor(response))
				window.scrollTo(0, 0)
			})
			.catch(response => {
				this.setState({error: response.message || response.error})
				window.scrollTo(0, 0)
			})
	}
}
