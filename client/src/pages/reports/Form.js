import React, {PropTypes} from 'react'
import {Checkbox, Table, Button, Collapse, HelpBlock} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import Fieldset from 'components/Fieldset'
import Form from 'components/Form'
import TextEditor from 'components/TextEditor'
import Autocomplete from 'components/Autocomplete'
import DatePicker from 'react-bootstrap-date-picker'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import PoamsSelector from 'components/PoamsSelector'
import LinkTo from 'components/LinkTo'
import History from 'components/History'
import HopscotchLauncher from 'components/HopscotchLauncher'
import ValidatableFormWrapper from 'components/ValidatableFormWrapper'

import API from 'api'
import {Report, Person} from 'models'

import CALENDAR_ICON from 'resources/calendar.png'
import LOCATION_ICON from 'resources/locations.png'
import POSITIVE_ICON from 'resources/thumbs_up.png'
import NEUTRAL_ICON from 'resources/neutral.png'
import NEGATIVE_ICON from 'resources/thumbs_down.png'
import REMOVE_ICON from 'resources/delete.png'
import WARNING_ICON from 'resources/warning.png'

export default class ReportForm extends ValidatableFormWrapper {
	static propTypes = {
		report: PropTypes.instanceOf(Report).isRequired,
		edit: PropTypes.bool
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
			isCancelled: (props.report.cancelledReason ? true : false),
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

	componentWillReceiveProps(nextProps) {
		let report = nextProps.report
		if (report.cancelledReason) {
			this.setState({isCancelled: true})
		}
	}

	render() {
		let {report} = this.props
		let {recents, errors, isCancelled} = this.state

		let hasErrors = Object.keys(errors).length > 0

		const invalidInputWarningMessage = <HelpBlock><b>
			<img src={WARNING_ICON} role="presentation" height="20px" />
			Location not found in database
		</b></HelpBlock>

		const {ValidatableForm, RequiredField} = this

		const SuggestedField = props => <RequiredField canSubmitWithError={true} {...props} />

		return <div className="report-form">
			<div className="pull-right">
				{this.props.startHopscotch && <HopscotchLauncher onClick={this.props.startHopscotch} />}
			</div>

			<ValidatableForm formFor={report} horizontal onSubmit={this.onSubmit} onChange={this.onChange}
				submitDisabled={hasErrors} submitText="Preview and submit">

				<Fieldset title={this.props.title} action={
					<Button bsStyle="primary" type="submit" disabled={hasErrors}>
						Preview and submit
					</Button>
				}>

					<SuggestedField id="intent" label="Meeting goal (purpose)" 
						placeholder="What happened?" data-focus componentClass="textarea" maxCharacters={250}>
						<Form.Field.ExtraCol>{250 - report.intent.length} characters remaining</Form.Field.ExtraCol>
					</SuggestedField>

					<Form.Field id="engagementDate" addon={CALENDAR_ICON}>
						<DatePicker showTodayButton placeholder="When did it happen?" dateFormat="DD/MM/YYYY" />
					</Form.Field>

					<Form.Field id="location" addon={LOCATION_ICON} validationState={errors.location}
						postInputGroupChildren={errors.location && invalidInputWarningMessage}>
						<Autocomplete valueKey="name" placeholder="Start typing to search for the location where this happened..." url="/api/locations/search" />
						<Form.Field.ExtraCol className="shortcut-list">
							{recents.locations && recents.locations.length > 0 &&
								<Button bsStyle="link"  onClick={this.setLocation.bind(this,recents.locations[0])} >Add {recents.locations[0].name}</Button>
							}
						</Form.Field.ExtraCol>
					</Form.Field>

					<Form.Field id="isCancelled" value={isCancelled} label="">
						<Checkbox inline onChange={this.toggleCancelled} checked={isCancelled} >
							This engagement was cancelled
						</Checkbox>
					</Form.Field>

					{!isCancelled &&
						<Form.Field id="atmosphere">
							<ButtonToggleGroup>
								<Button value="POSITIVE" id="positiveAtmos" ><img src={POSITIVE_ICON} height={25} alt="positive" /></Button>
								<Button value="NEUTRAL" id="neutralAtmos" ><img src={NEUTRAL_ICON} height={25} alt="neutral" /></Button>
								<Button value="NEGATIVE" id="negativeAtmos" ><img src={NEGATIVE_ICON} height={25} alt="negative" /></Button>
							</ButtonToggleGroup>
						</Form.Field>
					}

					{!isCancelled && report.atmosphere && report.atmosphere !== 'POSITIVE' &&
						<Form.Field id="atmosphereDetails" placeholder={`Why was this engagement ${report.atmosphere}?`} />
					}

					{isCancelled &&
						<Form.Field id="cancelledReason" componentClass="select" >
							<option value="CANCELLED_BY_ADVISOR">Cancelled by Advisor</option>
							<option value="CANCELLED_BY_PRINCIPAL">Cancelled by Principal</option>
							<option value="CANCELLED_DUE_TO_TRANSPORTATION">Cancelled due to Transportation</option>
							<option value="CANCELLED_DUE_TO_FORCE_PROTECTION">Cancelled due to Force Protection</option>
							<option value="CANCELLED_DUE_TO_ROUTES">Cancelled due to Routes</option>
							<option value="CANCELLED_DUE_TO_THREAT">Cancelled due to Threat</option>
						</Form.Field>
					}
				</Fieldset>

				<Fieldset title="Meeting attendance">
					<Form.Field id="attendees" validationState={errors.attendees}>
						<Autocomplete objectType={Person}
							onChange={this.addAttendee}
							onErrorChange={this.attendeeError}
							clearOnSelect={true}
							fields={'id, name, role, position { id, name, organization { id, shortName}} '}
							queryParams={{status: 'ACTIVE'}}
							template={person =>
								<span>
									<img src={(new Person(person)).iconUrl()} alt={person.role} height={20} className="person-icon" />
									{person.name} {person.rank && person.rank.toUpperCase()} - {person.position && `(${person.position.name})`}
								</span>
							}
							placeholder="Start typing to search for people who attended the meeting..."
							valueKey="name" />

						{errors.attendees && <HelpBlock>
							<img src={WARNING_ICON} role="presentation" height="20px" />
							Person not found in ANET Database.
						</HelpBlock>}

						<Table hover condensed id="attendeesTable" className="borderless">
							<thead>
								<tr>
									<th style={{textAlign: 'center'}}>Primary</th>
									<th>Name</th>
									<th>Position</th>
									<th>Org</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{Person.map(report.attendees.filter(p => p.role === "ADVISOR"), (person, idx) =>
									this.renderAttendeeRow(person, idx)
								)}
								<tr><td colSpan={5}><hr className="attendee-divider" /></td></tr>
								{Person.map(report.attendees.filter(p => p.role === "PRINCIPAL"), (person, idx) =>
									this.renderAttendeeRow(person, idx)
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
				</Fieldset>

				{!isCancelled &&
					<PoamsSelector poams={report.poams}
						shortcuts={recents.poams}
						onChange={this.onChange}
						onErrorChange={this.onPoamError}
						validationState={errors.poams}
						optional={true} />
				}

				<Fieldset title="Meeting discussion">
					{!isCancelled &&
						<SuggestedField id="keyOutcomes" componentClass="textarea" maxCharacters={250} humanName="Key outcome description">
							<Form.Field.ExtraCol><small>{250 - report.keyOutcomes.length} characters remaining</small></Form.Field.ExtraCol>
						</SuggestedField>
					}

					<SuggestedField id="nextSteps" componentClass="textarea" maxCharacters={250} humanName="Next steps description">
						<Form.Field.ExtraCol><small>{250 - report.nextSteps.length} characters remaining</small></Form.Field.ExtraCol>
					</SuggestedField>

					<Button className="center-block toggle-section-button" onClick={this.toggleReportText} id="toggleReportDetails" >
						{this.state.showReportText ? 'Hide' : 'Add'} detailed comments
					</Button>

					<Collapse in={this.state.showReportText}>
						<div>
							<Form.Field id="reportText" label="" horizontal={false} className="reportTextField" >
								<TextEditor label="Report Details" id="reportTextEditor" />
							</Form.Field>
						</div>
					</Collapse>
				</Fieldset>
			</ValidatableForm>
		</div>
	}

	@autobind
	toggleReportText() {
		this.setState({showReportText: !this.state.showReportText})
	}

	@autobind
	toggleCancelled() {
		//Toggle the isCancelled state. And set a default reason if necessary
		let cancelled = !this.state.isCancelled
		this.props.report.cancelledReason = (cancelled) ? 'CANCELLED_BY_ADVISOR' : null
		this.setState({isCancelled: cancelled})
	}

	@autobind
	setLocation(location) {
		this.props.report.location = location
		this.onChange()
	}

	@autobind
	addAttendee(newAttendee) {
		this.props.report.addAttendee(newAttendee)
		this.onChange()
	}

	@autobind
	attendeeError(isError, message) {
		let errors = this.state.errors
		if (isError) {
			errors.attendees = 'error'
		} else {
			delete errors.attendees
		}
		this.setState({errors})
	}

	@autobind
	renderAttendeeRow(person, idx) {
		return <tr key={person.id}>
			<td className="primary-attendee">
				<Checkbox checked={person.primary} onChange={this.setPrimaryAttendee.bind(this, person)} id={'attendeePrimary_' + person.role + "_" + idx}/>
			</td>

			<td id={"attendeeName_" + person.role + "_" + idx} >
				<img src={person.iconUrl()} alt={person.role} height={20} className="person-icon" />
				{person.name} {person.rank && person.rank.toUpperCase()}
			</td>
			<td><LinkTo position={person.position} /></td>
			<td>{person.position && person.position.organization && person.position.organization.shortName}</td>

			<td onClick={this.removeAttendee.bind(this, person)} id={'attendeeDelete_' + person.role + "_" + idx} >
				<span style={{cursor: 'pointer'}}><img src={REMOVE_ICON} height={14} alt="Remove attendee" /></span>
			</td>
		</tr>
	}


	@autobind
	onPoamError(isError, message) {
		let errors = this.state.errors
		if (isError) {
			errors.poams = 'error'
		} else {
			delete errors.poams
		}
		this.setState({errors})
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
		let errors = this.state.errors
		if (report.location && (typeof report.location !== 'object')) {
			errors.location = 'error'
		} else {
			delete errors.location
		}

		return errors
	}

	@autobind
	onCancel() {
		History.goBack()
	}

	@autobind
	onSubmit(event) {
		let {report, edit} = this.props
		let isCancelled = this.state.isCancelled

		if(report.primaryAdvisor) { report.attendees.find(a => a.id === report.primaryAdvisor.id).isPrimary = true }
		if(report.primaryPrincipal) { report.attendees.find(a => a.id === report.primaryPrincipal.id).isPrimary = true }

		delete report.primaryPrincipal
		delete report.primaryAdvisor
		report.attendees = report.attendees.map(a =>
			Object.without(a, 'position')
		)

		if (!isCancelled) {
			delete report.cancelledReason
		}

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
				History.push(Report.pathFor(report), {
					success: 'Report saved successfully',
					skipPageLeaveWarning: true
				})
			})
			.catch(response => {
				this.setState({error: {message: response.message || response.error}})
				window.scrollTo(0, 0)
			})
	}
}
