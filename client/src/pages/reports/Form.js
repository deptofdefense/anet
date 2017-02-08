import React, {Component, PropTypes} from 'react'
import {InputGroup, Radio, Checkbox, Table, Button, Collapse, HelpBlock} from 'react-bootstrap'
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
		defaultAttendee: PropTypes.instanceOf(Person),
	}

	constructor(props) {
		super(props)

		this.state = {
			recents: {
				persons: [],
				locations: [],
				poams: [],
			},

			showReportText: false,
			errors: {}
		}
	}

	componentDidMount() {
		API.query(/* GraphQL */`
			locationList(f:recents) {
				list { id, name }
			}
			personList(f:recents) {
				list { id, name, rank, role, position { id, name, organization {id, shortName}} }
			}
			poamList(f:recents) {
				list { id, shortName, longName }
			}
		`).then(data => {
			let newState = {
				recents: {
					locations: data.locationList.list,
					persons: data.personList.list,
					poams: data.poamList.list,
				},
			}
			this.setState(newState)
		})
	}

	componentDidUpdate() {
		let {report, defaultAttendee} = this.props
		if (defaultAttendee && defaultAttendee.id && !report.attendees.length) {
			this.addAttendee(defaultAttendee)
		}
	}

	render() {
		let {report} = this.props
		let {recents, errors} = this.state

		return <Form formFor={report} horizontal onChange={this.onChange} onSubmit={this.onSubmit} submitText="Save report">
			<fieldset>
				<legend>Engagement Details <small>Required</small></legend>

				<Form.Field id="intent" label="The goal of this meeting is to" placeholder="What happened?" data-focus>
					<Form.Field.ExtraCol>{250 - report.intent.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>

				<Form.Field id="engagementDate">
					<DatePicker showTodayButton placeholder="When did it happen?" dateFormat="DD/MM/YYYY">
						<InputGroup.Addon>
							<img src="/assets/img/calendar.png" height="20px" role="presentation"/>
						</InputGroup.Addon>
					</DatePicker>
				</Form.Field>

				<Form.Field id="location" addon="📍"validationState={errors.location} >
					<Autocomplete valueKey="name" placeholder="Start typing to search for the location where this happened..." url="/api/locations/search" />
					{errors.location && <HelpBlock><b>Location not found in database</b></HelpBlock>}

					<Form.Field.ExtraCol className="shortcut-list">
						{recents.locations && recents.locations.length > 0 &&
							<Button bsStyle="link"  onClick={this.setLocation.bind(this,recents.locations[0])} >Add {recents.locations[0].name}</Button>
						}
					</Form.Field.ExtraCol>
				</Form.Field>

				{false && <Form.Field id="cancelled" label="">
					<Checkbox>Engagement was cancelled?</Checkbox>
				</Form.Field>}

				{!report.cancelled &&
					<Form.Field id="atmosphere">
						<RadioGroup bsSize="large">
							<Radio value="POSITIVE"><img src="/assets/img/thumbs_up.png" height="25px" alt="positive" /></Radio>
							<Radio value="NEUTRAL"><img src="/assets/img/neutral.png" height="25px" alt="neutral" /></Radio>
							<Radio value="NEGATIVE"><img src="/assets/img/thumbs_down.png" height="25px" alt="negative" /></Radio>
						</RadioGroup>
					</Form.Field>
				}

				{!report.cancelled && report.atmosphere && report.atmosphere !== 'POSITIVE' &&
					<Form.Field id="atmosphereDetails" placeholder={"Why was this engagement " + report.atmosphere} />
				}
			</fieldset>

			<fieldset>
				<legend>Meeting Attendance <small>Required</small></legend>

				<Form.Field id="attendees" validationState={errors.attendees} >
					<Autocomplete objectType={Person}
						onChange={this.addAttendee}
						onErrorChange={this.attendeeError}
						clearOnSelect={true}
						fields={"id, name, role, position { id, name, organization { id, shortName}} "}
						template={person =>
							<span>{person.name} {person.rank && person.rank.toUpperCase()} - {person.position && `(${person.position.name})`}</span>
						}
						placeholder="Start typing to search for people who attended the meeting..."
						valueKey="name" />
					{errors.attendees && <HelpBlock>Help text with validation state.</HelpBlock> }
					<Table hover striped>
						<thead>
							<tr>
								<th></th>
								<th style={{textAlign: 'center'}}>Primary</th>
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

									<td className="primary-attendee">
										<Checkbox checked={person.primary} onChange={this.setPrimaryAttendee.bind(this, person)} />
									</td>

									<td>
										<img src={person.iconUrl()} alt={person.role} height={20} width={20} className="person-icon" />
										{person.name} {person.rank && person.rank.toUpperCase()}
									</td>
									<td><LinkTo position={person.position} /></td>
									<td>{person.position && person.position.organization && person.position.organization.shortName}</td>
								</tr>
							)}
						</tbody>
					</Table>

					{recents.persons.length > 0 &&
						<Form.Field.ExtraCol className="shortcut-list">
							<h5>Shortcuts</h5>
							{Person.map(recents.persons, person =>
								<Button key={person.id} bsStyle="link" onClick={this.addAttendee.bind(this, person)}>Add {person.name}</Button>
							)}
					</Form.Field.ExtraCol>
					}
				</Form.Field>
			</fieldset>

			<PoamsSelector poams={report.poams}
				shortcuts={recents.poams}
				onChange={this.onChange}
				onErrorChange={this.onPoamError}
				validationState={errors.poams}
				optional={true} />

			<fieldset>
				<legend>Meeting Discussion <small>Required</small></legend>


				<Form.Field id="keyOutcomes">
					<Form.Field.ExtraCol><small>{250 - report.keyOutcomes.length}</small></Form.Field.ExtraCol>
				</Form.Field>

				<Form.Field id="nextSteps">
					<Form.Field.ExtraCol><small>{250 - report.nextSteps.length}</small></Form.Field.ExtraCol>
				</Form.Field>

				<Button className="center-block toggle-section-button" onClick={this.toggleReportText}>
					{this.state.showReportText ? "Hide" : "Add"} detailed comments
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
	toggleReportText() {
		this.setState({showReportText: !this.state.showReportText})
	}

	@autobind
	setLocation(location) {
		this.props.report.location = location;
		this.onChange();
	}

	@autobind
	addAttendee(newAttendee) {
		if (!newAttendee || !newAttendee.id) {
			return
		}

		let report = this.props.report
		let attendees = report.attendees

		if (attendees.find(attendee => attendee.id === newAttendee.id)) {
			return
		}

		let person = new Person(newAttendee)
		person.primary = false

		if (!attendees.find(attendee => attendee.role === person.role && attendee.primary)) {
			person.primary = true
		}

		attendees.push(person)
		this.onChange()
	}

	@autobind
	attendeeError(isError, message) {
		let errors = this.state.errors;
		errors.attendees = isError ? "error" : null
		this.setState({errors});
	}

	@autobind
	onPoamError(isError, message) {
		let errors = this.state.errors;
		errors.poams = isError ? "error" : null
		this.setState({errors});
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
		this.setState({errors : this.validateReport()})
		this.forceUpdate()
	}

	@autobind
	validateReport() {
		let report = this.props.report
		let errors = this.state.errors;
		if (report.location && (typeof report.location !== "object")) {
			errors.location = "error"
		} else {
			errors.location = null;
		}

		return errors;
	}

	@autobind
	onSubmit(event) {
		let {report, edit} = this.props

		if(report.primaryAdvisor) { report.attendees.find(a => a.id === report.primaryAdvisor.id).isPrimary = true }
		if(report.primaryPrincipal) { report.attendees.find(a => a.id === report.primaryPrincipal.id).isPrimary = true }

		delete report.primaryPrincipal
		delete report.primaryAdvisor
		delete report.cancelled
		report.attendees = report.attendees.map(a =>
			Object.without(a, 'position')
		)

		let url = `/api/reports/${edit ? 'update' : 'new'}`
		API.send(url, report, {disableSubmits: true})
			.then(response => {
				if (response.id) {
					report.id = response.id
				}

				// this updates the current page URL on model/new to be the edit page,
				// so that if you press back after saving a new model, it takes you
				// back to editing the model you just saved
				History.replace(Report.pathForEdit(report), false)

				// then after, we redirect you to the to page
				History.push(Report.pathFor(report), {success: "Report saved successfully"})
			})
			.catch(response => {
				this.setState({error: {message: response.message || response.error}})
				window.scrollTo(0, 0)
			})
	}
}
