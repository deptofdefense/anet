import React, {Component} from 'react'

import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import Form from 'components/Form'
import DatePicker from 'react-bootstrap-date-picker'
import {InputGroup, Radio, Table, Button, Collapse} from 'react-bootstrap'
import RadioGroup from 'components/RadioGroup'
import LinkTo from 'components/LinkTo'
import PoamsSelector from 'components/PoamsSelector'
import autobind from 'autobind-decorator'
import {Person} from 'models'

export default class ReportForm extends Component {
	static propTypes = {
		report: React.PropTypes.object.isRequired,
		recents: React.PropTypes.object.isRequired,
		onChange: React.PropTypes.func.isRequired,
		onSubmit: React.PropTypes.func,
		edit: React.PropTypes.bool,
		actionText: React.PropTypes.string,
		error: React.PropTypes.string,
	}

	static contextTypes = {
		app: React.PropTypes.object,
	}

	constructor(props) {
		super(props)

		this.state = {
			showKeyOutcomesText: false,
			showNextStepsText: false,
			showReportText: false
		}
	}

	render() {
		let {report, recents, onChange, onSubmit, actionText, error} = this.props

		return <Form formFor={report} onChange={onChange}
			onSubmit={onSubmit} horizontal
			actionText={actionText}>

			{error &&
				<fieldset className="text-danger" >
					<p>There was a problem saving this report</p>
					<p>{error}</p>
				</fieldset>}


			<fieldset>
				<legend>Engagement Details<small>Required</small></legend>

				<Form.Field id="intent" label="Meeting subject" placeholder="What happened?" data-focus>
					<Form.Field.ExtraCol>{250 - report.intent.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>

				<Form.Field id="engagementDate">
					<DatePicker showTodayButton placeholder="When did it happen?">
						<InputGroup.Addon>📆</InputGroup.Addon>
					</DatePicker>
				</Form.Field>

				<Form.Field id="location" addon="📍">
					<Autocomplete valueKey="name" placeholder="Where did it happen?" url="/api/locations/search" />
				</Form.Field>

				<Form.Field id="atmosphere">
					<RadioGroup bsSize="large">
						<Radio value="POSITIVE">👍</Radio>
						<Radio value="NEUTRAL">😐</Radio>
						<Radio value="NEGATIVE">👎</Radio>
					</RadioGroup>
				</Form.Field>

				{report.atmosphere && report.atmosphere !== 'POSITIVE' &&
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

			<PoamsSelector poams={report.poams} shortcuts={recents.poams} onChange={onChange}/>

			<fieldset>
				<legend>Meeting Discussion<small>Required</small></legend>
				<Form.Field id="keyOutcomesSummary" >
					<Form.Field.ExtraCol>{250 - report.keyOutcomesSummary.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>

				<Button bsStyle="link" onClick={this.toggleKeyOutcomesText} >
					{this.state.showKeyOutcomesText ? "Hide" : "Add" } details to Key Outcomes
				</Button>
				<Collapse in={this.state.showKeyOutcomesText} >
					<Form.Field id="keyOutcomes" label="" horizontal={false}>
						<TextEditor label="Key outcomes" />
					</Form.Field>
				</Collapse>

				<Form.Field id="nextStepsSummary" >
					<Form.Field.ExtraCol>{250 - report.nextStepsSummary.length} characters remaining</Form.Field.ExtraCol>
				</Form.Field>
				<Button bsStyle="link" onClick={this.toggleNextStepsText} >Add details to Next Steps</Button>
				<Collapse in={this.state.showNextStepsText} >
					<Form.Field id="nextSteps" label="" horizontal={false} style={{marginTop: '5rem'}}>
						<TextEditor label="Next steps" />
					</Form.Field>
				</Collapse>

				<Button bsStyle="link" onClick={this.toggleReportText} >Add additional report details</Button>
				<Collapse in={this.state.showReportText} >
					<Form.Field id="reportText" label="" horizontal={false} >
						<TextEditor label="Report Details" />
					</Form.Field>
				</Collapse>

			</fieldset>
		</Form>
	}

	@autobind
	toggleKeyOutcomesText() {
		this.setState({showKeyOutcomesText: !this.state.showKeyOutcomesText});
	}

	@autobind
	toggleNextStepsText() {
		this.setState({showNextStepsText: !this.state.showNextStepsText});
	}

	@autobind
	toggleReportText() {
		this.setState({showReportText: !this.state.showReportText});
	}

	@autobind
	addAttendee(newAttendee) {
		if (!newAttendee || !newAttendee.id)
			return

		let report = this.props.report
		let attendees = report.attendees

		if (attendees.find(attendee => Person.isEqual(attendee, newAttendee)))
			return

		let person = new Person(newAttendee)
		person.primary = false

		if (!attendees.find(attendee => attendee.role === person.role && attendee.primary))
			person.primary = true

		attendees.push(person)
		this.props.onChange()
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

			this.props.onChange()
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

		this.props.onChange()
	}

	@autobind
	addMyself() {
		let {currentUser} = this.context.app.state
		this.addAttendee(currentUser)
		this.setPrimaryAttendee(currentUser)
	}
}
