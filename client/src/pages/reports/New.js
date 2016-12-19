import React from 'react'
import {InputGroup, Radio, Table, Glyphicon, Button} from 'react-bootstrap'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from '../../components/Header'
import {Form, HorizontalFormField} from '../../components/FormField'
import RadioGroup from '../../components/RadioGroup'
import Breadcrumbs from '../../components/Breadcrumbs'
import Autocomplete from '../../components/Autocomplete'
import TextEditor from '../../components/TextEditor'

import API from '../../api'

export default class ReportNew extends React.Component {
	static useNavigation = false

	constructor(props) {
		super(props)
		this.state = {
			report: {engagementIntent: '', location: ''},
			reportAtmosphere: 'positive',
			attendees: [],
			poams: [],
			recentPeople: [],
			recentPoams: [],
		}

		this.onFormChange = this.onFormChange.bind(this)
		this.onAtmosphereChange = this.onAtmosphereChange.bind(this)
		this.addAttendee = this.addAttendee.bind(this)
		this.addPoam = this.addPoam.bind(this)
	}

	componentDidMount() {
		API.fetch('/api/reports/new')
			.then(data => this.setState(data))
	}

	render() {
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', '/reports/new']]} />

				<Form formFor={this.state.report} onChange={this.onFormChange} horizontal>
					<fieldset>
						<legend>Engagement details <small>Required</small></legend>

						<HorizontalFormField id="engagementIntent" label="Meeting subject" placeholder="What happened?" data-focus>
							<HorizontalFormField.Col>{this.subjectCharactersRemaining()}</HorizontalFormField.Col>
						</HorizontalFormField>

						<HorizontalFormField id="engagementDate">
							<DatePicker placeholder="When did it happen?">
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</HorizontalFormField>

						<HorizontalFormField id="engagementLocation" addon="📍">
							<Autocomplete value={this.state.report.location} placeholder="Where did it happen?" url="/api/locations/search" />
						</HorizontalFormField>

						<HorizontalFormField id="atmosphere">
							<RadioGroup size="large" onChange={this.onAtmosphereChange}>
								<Radio value="positive">👍</Radio>
								<Radio value="neutral">😐</Radio>
								<Radio value="negative">👎</Radio>
							</RadioGroup>
						</HorizontalFormField>

						<HorizontalFormField id="atmosphereDetails" className={this.state.reportAtmosphere === 'positive' && 'hide'} />
					</fieldset>

					<fieldset>
						<legend>Meeting attendance <small>Required</small></legend>

						<HorizontalFormField id="addAttendee">
							<Autocomplete value="" placeholder="Who was there?" url="/api/people/search" onChange={this.addAttendee} template={person =>
								<span>{person.name} {person.rank.toUpperCase()}</span>
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
									{this.state.attendees.map(person => <tr key={person.id}>
										<td onClick={this.removeAttendee.bind(this, person)}>
											<Glyphicon glyph="remove-sign" style={{cursor: 'pointer'}} />
										</td>
										<td>{person.name} {person.rank.toUpperCase()}</td>
										<td>{person.role}</td>
									</tr>)}
								</tbody>
							</Table>

							<HorizontalFormField.Col style={{marginTop: '-28px'}}>
								<h5 style={{textDecoration: 'underline'}}>Shortcuts</h5>
								<Button bsStyle="link">Add myself</Button>
								{this.state.recentPeople.map(person =>
									<Button key={person.id} bsStyle="link" onClick={this.addAttendee.bind(this, person)}>Add {person.name}</Button>
								)}
							</HorizontalFormField.Col>
						</HorizontalFormField>
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>

						<HorizontalFormField id="poams">
							<Autocomplete value="" url="/api/poams/search" onChange={this.addPoam} template={poam =>
								<span>{poam.shortName} - {poam.longName}</span>
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
									{this.state.poams.map(poam => <tr key={poam.id}>
										<td onClick={this.removePoam.bind(this, poam)}>
											<Glyphicon glyph="remove-sign" style={{cursor: 'pointer'}} />
										</td>
										<td>{poam.longName}</td>
										<td>{poam.shortName}</td>
									</tr>)}
								</tbody>
							</Table>

							<HorizontalFormField.Col style={{marginTop: '-28px'}}>
								<h5 style={{textDecoration: 'underline'}}>Shortcuts</h5>
								{this.state.recentPoams.map(poam =>
									<Button key={poam.id} bsStyle="link" onClick={this.addPoam.bind(this, poam)}>Add "{poam.longName}"</Button>
								)}
							</HorizontalFormField.Col>
						</HorizontalFormField>
					</fieldset>

					<fieldset>
						<legend>Meeting discussion</legend>

						<TextEditor label="Discussion outcome" />
						<TextEditor label="Next steps" style={{marginTop: '5rem'}} />
					</fieldset>
				</Form>
			</div>
		)
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
}
