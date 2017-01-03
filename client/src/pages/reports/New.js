import React from 'react'
import Page from 'components/Page'
import History from 'components/History'
import {InputGroup, Radio, Table, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import DatePicker from 'react-bootstrap-date-picker'

import {ContentForHeader} from 'components/Header'
import Form from 'components/Form'
import RadioGroup from 'components/RadioGroup'
import Breadcrumbs from 'components/Breadcrumbs'
import Autocomplete from 'components/Autocomplete'
import TextEditor from 'components/TextEditor'

import API from 'api'
import Report from 'models/Report'

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	constructor(props) {
		super(props)

		this.state = {
			report: new Report(),

			recents: {
				persons: [],
				locations: [],
				poams: [],
			}
		}
	}

	fetchData() {
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

				<Form formFor={report} onChange={this.onChange} onSubmit={this.onSubmit} actionText="Create report" horizontal>
					{this.state.error && <fieldset><p>There was a problem saving this report.</p><p>{this.state.error}</p></fieldset>}
					<fieldset>
						<legend>Engagement details <small>Required</small></legend>

						<Form.Field id="intent" label="Meeting subject" placeholder="What happened?" data-focus>
							<Form.Field.ExtraCol>{250 - report.intent.length} characters remaining</Form.Field.ExtraCol>
						</Form.Field>

						<Form.Field id="engagementDate">
							<DatePicker placeholder="When did it happen?">
								<InputGroup.Addon>📆</InputGroup.Addon>
							</DatePicker>
						</Form.Field>

						<Form.Field id="location" addon="📍">
							<Autocomplete valueKey="name" placeholder="Where did it happen?" url="/api/locations/search" />
						</Form.Field>

						<Form.Field id="atmosphere">
							<RadioGroup bsSize="large">
								<Radio value="positive">👍</Radio>
								<Radio value="neutral">😐</Radio>
								<Radio value="negative">👎</Radio>
							</RadioGroup>
						</Form.Field>

						{report.atmosphere && report.atmosphere !== 'positive' &&
							<Form.Field id="atmosphereDetails" />
						}
					</fieldset>

					<fieldset>
						<legend>Meeting attendance <small>Required</small></legend>

						<Form.Field id="attendees">
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

							<Form.Field.ExtraCol className="shortcut-list">
								<h5>Shortcuts</h5>
								<Button bsStyle="link">Add myself</Button>
								{recents.persons.map(person =>
									<Button key={person.id} bsStyle="link" onClick={this.addAttendee.bind(this, person)}>Add {person.name}</Button>
								)}
							</Form.Field.ExtraCol>
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Milestones</legend>

						<Form.Field id="poams">
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

							<Form.Field.ExtraCol className="shortcut-list">
								<h5>Shortcuts</h5>
								{recents.poams.map(poam =>
									<Button key={poam.id} bsStyle="link" onClick={this.addPoam.bind(this, poam)}>Add "{poam.longName}"</Button>
								)}
							</Form.Field.ExtraCol>
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Meeting discussion</legend>

						<Form.Field id="reportText" label="" horizontal={false}>
							<TextEditor label="Key outcomes" />
						</Form.Field>

						<Form.Field id="nextSteps" label="" horizontal={false} style={{marginTop: '5rem'}}>
							<TextEditor label="Next steps" />
						</Form.Field>
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

		this.state.report.save({disableSubmits: true})
			.then(report => {
				History.push(report.toPath())
			})
			.catch(error => {
				this.setState({errors: error})
				window.scrollTo(0, 0)
			})
	}

	@autobind
	addAttendee(newAttendee) {
		let report = this.state.report
		let attendees = report.attendees

		if (!attendees.find(attendee => attendee.id === newAttendee.id)) {
			attendees.push(newAttendee)
		}

		this.setState({report})
	}

	@autobind
	removeAttendee(oldAttendee) {
		let report = this.state.report
		let attendees = report.attendees
		let index = attendees.findIndex(attendee => attendee.id === oldAttendee.id)

		if (index !== -1) {
			attendees.splice(index, 1)
			this.setState({report})
		}
	}

	@autobind
	addPoam(newPoam) {
		let report = this.state.report
		let poams = report.poams

		if (!poams.find(poam => poam.id === newPoam.id)) {
			poams.push(newPoam)
		}

		this.setState({report})
	}

	@autobind
	removePoam(oldPoam) {
		let report = this.state.report
		let poams = report.poams
		let index = poams.findIndex(poam => poam.id === oldPoam.id)

		if (index !== -1) {
			poams.splice(index, 1)
			this.setState({report})
		}
	}
}
