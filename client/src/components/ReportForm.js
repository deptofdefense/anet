import React, {Component, PropTypes} from 'react'
import {InputGroup, Radio, Checkbox, Table, Button, Collapse} from 'react-bootstrap'
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
				id, name, rank, role, position { id, name, organization {id, shortName}}
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
		})
	}

	render() {
		let {report} = this.props
		let {recents} = this.state

		return <Form formFor={report} horizontal onChange={this.onChange} onSubmit={this.onSubmit} submitText="Save report">
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
					<Autocomplete valueKey="name" placeholder="Start typing to search for the location where this happened..." url="/api/locations/search" />
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
				<legend>Meeting Attendance <small>Required</small></legend>

				<Form.Field id="attendees">
					<Autocomplete objectType={Person} onChange={this.addAttendee}
						clearOnSelect={true}
						fields={"id, name, role, position { id, name, organization { id, shortName}} "}
						template={person =>
							<span>{person.name} {person.rank && person.rank.toUpperCase()}</span>
						}
						placeholder="Start typing to search for people who attended the meeting..."
						valueKey="name" />

					<Table hover striped>
						<thead>
							<tr>
								<th></th>
								<th>Primary</th>
								<th>Name</th>
								<th>Position</th>
								<th>Org</th>
							</tr>
						</thead>
						<tbody>
							{Person.map(report.attendees, person =>
								<tr key={person.id}>
									<td onClick={this.removeAttendee.bind(this, person)}>
										<span style={{cursor: 'pointer'}}>⛔️</span>
									</td>

									<td onClick={this.setPrimaryAttendee.bind(this, person)} className={"primaryAttendee" + person.primary ? "Yes" : "No" }>
										<span style={{cursor: 'pointer'}} >
											<img alt="star" src={"/assets/img/" + (person.primary ? "star_yellow.png" : "star_outline.png" )} width={18} height={18}/>
										</span>
									</td>

									<td>
										<img src={person.iconUrl()} alt={person.role} height={20} width={20} className="personIcon" />
										{person.name} {person.rank && person.rank.toUpperCase()}
									</td>
									<td><LinkTo position={person.position} /></td>
									<td>{person.position && person.position.organization && person.position.organization.shortName}</td>
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

			<PoamsSelector poams={report.poams} shortcuts={recents.poams} onChange={this.onChange} optional={true} />

			<fieldset>
				<legend>Meeting Discussion <small>Required</small></legend>
				<Form.Field id="keyOutcomesSummary">
					<Form.Field.ExtraCol>{250 - report.keyOutcomesSummary.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>
				<Button bsStyle="link" onClick={this.toggleKeyOutcomesText}>
					{this.state.showKeyOutcomesText ? "Hide" : "Add" } details to Key Outcomes
				</Button>

				<Collapse in={this.state.showKeyOutcomesText}>
					<div>
						<Form.Field id="keyOutcomes" label="" horizontal={false}>
							<TextEditor label="Key outcomes" />
						</Form.Field>
					</div>
				</Collapse>

				<Form.Field id="nextStepsSummary">
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
					{this.state.showReportText ? "Hide" : "Add" } detailed comments
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
				if (response.id) {
					report.id = response.id
				}

				// this updates the current page URL on model/new to be the edit page,
				// so that if you press back after saving a new model, it takes you
				// back to editing the model you just saved
				History.replace({
					pathname: Report.pathForEdit(report),
				})

				// then after, we redirect you to the to page
				History.push({
					pathname: Report.pathFor(report),
					state: {success: "Saved Report"},
				})

				window.scrollTo(0, 0)
			})
			.catch(response => {
				this.setState({error: {message: response.message || response.error}})
				window.scrollTo(0, 0)
			})
	}
}
