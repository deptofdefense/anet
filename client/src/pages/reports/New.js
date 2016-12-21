import React from 'react'
import {InputGroup, Radio, Table, Button} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from '../../components/Header'
import Form from '../../components/Form'
import FormField from '../../components/FormField'
import RadioGroup from '../../components/RadioGroup'
import Breadcrumbs from '../../components/Breadcrumbs'
import Autocomplete from '../../components/Autocomplete'
import TextEditor from '../../components/TextEditor'

import API from '../../api'

export default class ReportNew extends React.Component {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
	}

	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)
		this.state = {
			report: {
				engagementIntent: '',
				atmosphere: '',
				location: {},
				attendees: [],
				poams: [],
			},
			recents: {persons: [], locations: [], poams: []}
		}

		this.onFormChange = this.onFormChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.onAtmosphereChange = this.onAtmosphereChange.bind(this)
		this.addAttendee = this.addAttendee.bind(this)
		this.addPoam = this.addPoam.bind(this)
		this.setLocation = this.setLocation.bind(this)
	}

	componentDidMount() {
		API.query(`
			locations(f:recents) {
				id, name
			}
			persons(f:recents) {
				id, name, rank, role
			}
			poams(f:recents) {
				id, shortName, longName
			}
		`).then(data => this.setState({recents: data}))
	}

	render() {
		let report = this.state.report
		let recents = this.state.recents

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form formFor={report} onSubmit={this.onSubmit} horizontal>
					{this.state.error && <fieldset><p>There was a problem saving this report.</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Engagement details <small>Required</small></legend>

						<FormField id="engagementIntent" label="Meeting subject" placeholder="What happened?" data-focus>
							<FormField.ExtraCol>{this.subjectCharactersRemaining()}</FormField.ExtraCol>
						</FormField>

						<FormField id="engagementDate">
							<DatePicker placeholder="When did it happen?">
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</FormField>

						<FormField id="engagementLocation" addon="📍">
							<Autocomplete value="" onChange={this.setLocation} placeholder="Where did it happen?" url="/api/locations/search" />
						</FormField>

						<FormField id="atmosphere">
							<RadioGroup bsSize="large" onChange={this.onAtmosphereChange}>
								<Radio value="positive">👍</Radio>
								<Radio value="neutral">😐</Radio>
								<Radio value="negative">👎</Radio>
							</RadioGroup>
						</FormField>

						<FormField id="atmosphereDetails" className={this.state.reportAtmosphere === 'positive' && 'hide'} />
					</fieldset>

					<fieldset>
						<legend>Meeting attendance <small>Required</small></legend>

						<FormField id="addAttendee">
							<Autocomplete value="" placeholder="Who was there?" url="/api/people/search" onChange={this.addAttendee} template={person =>
								<span>{person.name} {person.rank && person.rank.toUpperCase()}</span>
							} clearOnSelect={true} />

							<Table hover striped>
								<thead>
									<tr>
										<th></th>
										<th>Name</th>
										<th>Position</th>
									</tr>
								</thead>
								<tbody>
									{report.attendees.map(person => <tr key={person.id}>
										<td onClick={this.removeAttendee.bind(this, person)}>
											<span style={{cursor: 'pointer'}}>⛔️</span>
										</td>
										<td>{person.name} {person.rank && person.rank.toUpperCase()}</td>
										<td>{person.role}</td>
									</tr>)}
								</tbody>
							</Table>

							<FormField.ExtraCol className="shortcut-list">
								<h5>Shortcuts</h5>
								<Button bsStyle="link">Add myself</Button>
								{recents.persons.map(person =>
									<Button key={person.id} bsStyle="link" onClick={this.addAttendee.bind(this, person)}>Add {person.name}</Button>
								)}
							</FormField.ExtraCol>
						</FormField>
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>

						<FormField id="poams">
							<Autocomplete value="" url="/api/poams/search" onChange={this.addPoam} template={poam =>
								<span>{[poam.shortName, poam.longName].join(' - ')}</span>
							} clearOnSelect={true} />

							<Table hover striped>
								<thead>
									<tr>
										<th></th>
										<th>Name</th>
										<th>AO</th>
									</tr>
								</thead>
								<tbody>
									{report.poams.map(poam => <tr key={poam.id}>
										<td onClick={this.removePoam.bind(this, poam)}>
											<span style={{cursor: 'pointer'}}>⛔️</span>
										</td>
										<td>{poam.longName}</td>
										<td>{poam.shortName}</td>
									</tr>)}
								</tbody>
							</Table>

							<FormField.ExtraCol className="shortcut-list">
								<h5>Shortcuts</h5>
								{recents.poams.map(poam =>
									<Button key={poam.id} bsStyle="link" onClick={this.addPoam.bind(this, poam)}>Add "{poam.longName}"</Button>
								)}
							</FormField.ExtraCol>
						</FormField>
					</fieldset>

					<fieldset>
						<legend>Meeting discussion</legend>

						<TextEditor label="Discussion outcome" />
						<TextEditor label="Next steps" style={{marginTop: '5rem'}} />
					</fieldset>

					<fieldset>
						<Button bsSize="large" bsStyle="primary" type="submit" className="pull-right">Create report</Button>
					</fieldset>
				</Form>
			</div>
		)
	}

	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let report = this.state.report
		let data = {
			intent: report.engagementIntent,
			reportText: report.reportText,
			nextSteps: report.nextSteps,
			engagementDate: report.engagementDate,

			location: this.state.location ? {id: this.state.location.id} : null,
			attendees: this.state.attendees.map(person => { return {id: person.id}}),
			poams: this.state.poams.map(poam => { return {id: poam.id}}),
		}

		API.send('/api/reports/new', data)
			.then(report => {
				if (report.code) throw report.code
				console.log(report);
				this.context.router.push('/reports/' + report.id)
			}).catch(error => {
				this.setState({error: error})
				window.scrollTo(0, 0)
			})
	}

	onFormChange(event) {
		this.setState({report: this.state.report})
	}

	onAtmosphereChange(atmosphere) {
		this.setState({reportAtmosphere: atmosphere})
	}

	subjectCharactersRemaining() {
		let charactersRemaining = 250 - this.state.report.engagementIntent.length
		return charactersRemaining + " characters remaining"
	}

	addAttendee(attendee) {
		let attendees = this.state.attendees.slice(0)

		attendees.push(attendee)
		this.setState({attendees})
	}

	removeAttendee(attendee) {
		let attendees = this.state.attendees.slice(0)
		attendees.splice(attendees.indexOf(attendee), 1)
		this.setState({attendees})
	}

	addPoam(poam) {
		let poams = this.state.poams.slice(0)
		poams.push(poam)
		this.setState({poams})
	}

	removePoam(poam) {
		let poams = this.state.poams.slice(0)
		poams.splice(poams.indexOf(poam), 1)
		this.setState({poams})
	}

	setLocation(location) {
		this.setState({location})
	}
}
