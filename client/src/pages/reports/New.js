import React from 'react'
import {InputGroup, Radio, Table, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

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
				intent: '',
				engagementDate: '',
				atmosphere: '',
				location: {},
				attendees: [],
				poams: [],
			},
			recents: {persons: [], locations: [], poams: []}
		}
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

				<Form formFor={report} onChange={this.onChange} onSubmit={this.onSubmit} horizontal>
					{this.state.error && <fieldset><p>There was a problem saving this report.</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Engagement details <small>Required</small></legend>

						<FormField id="intent" label="Meeting subject" placeholder="What happened?" data-focus>
							<FormField.ExtraCol>{250 - report.intent.length} characters remaining</FormField.ExtraCol>
						</FormField>

						<FormField id="engagementDate">
							<DatePicker placeholder="When did it happen?" value={report.engagementDate}>
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</FormField>

						<FormField id="location" addon="📍">
							<Autocomplete value={report.location} valueKey="name" placeholder="Where did it happen?" url="/api/locations/search" />
						</FormField>

						<FormField id="atmosphere">
							<RadioGroup bsSize="large">
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
							<Autocomplete placeholder="Who was there?" url="/api/people/search" template={person =>
								<span>{person.name} {person.rank && person.rank.toUpperCase()}</span>
							} onChange={this.addAttendee} clearOnSelect={true} />

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
							<Autocomplete url="/api/poams/search" template={poam =>
								<span>{[poam.shortName, poam.longName].join(' - ')}</span>
							} onChange={this.addPoam} clearOnSelect={true} />

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

	@autobind
	onChange() {
		let report = this.state.report
		this.setState({report})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		document.querySelectorAll('form [type=submit]').forEach(button => button.disabled = true)

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

	@autobind
	onAtmosphereChange(atmosphere) {
		this.setState({reportAtmosphere: atmosphere})
	}

	@autobind
	addAttendee(attendee) {
		let report = this.state.report
		report.attendees.push(attendee)

		this.setState({report})
	}

	@autobind
	removeAttendee(attendee) {
		let report = this.state.report
		let attendees = report.attendees
		let index = attendees.indexOf(attendee)

		if (index !== -1) {
			attendees.splice(index, 1)
			this.setState({report})
		}
	}

	@autobind
	addPoam(poam) {
		let report = this.state.report
		report.poams.push(poam)

		this.setState({report})
	}

	@autobind
	removePoam(poam) {
		let report = this.state.report
		let poams = report.poams
		let index = poams.indexOf(poam)

		if (index !== -1) {
			poams.splice(index, 1)
			this.setState({report})
		}
	}

	@autobind
	setLocation(location) {
		this.setState({location})
	}
}
