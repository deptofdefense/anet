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
import LinkTo from 'components/LinkTo'

import API from 'api'
import {Report, Person, Poam} from 'models'

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: React.PropTypes.object,
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
		let {report, recents} = this.state
		console.log("render", report)
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', Report.pathForNew()]]} />

				<Form formFor={report} onChange={this.onChange} onSubmit={this.onSubmit} actionText="Save report" horizontal>
					{this.state.error &&
						<fieldset className="text-danger">
							<p>There was a problem saving this report.</p>
							<p>{this.state.error}</p>
						</fieldset>
					}

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
													{Person.isEqual(report.primaryAdvisor, person) || Person.isEqual(report.primaryPrincipal, person) ?
														"⭐️" : "☆"
													}
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
								<Button bsStyle="link" onClick={this.addMyself}>Add myself</Button>
								{Person.map(recents.persons, person =>
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
									{Poam.map(report.poams, poam =>
										<tr key={poam.id}>
											<td onClick={this.removePoam.bind(this, poam)}>
												<span style={{cursor: 'pointer'}}>⛔️</span>
											</td>
											<td>{poam.longName}</td>
											<td>{poam.shortName}</td>
										</tr>
									)}
								</tbody>
							</Table>

							<Form.Field.ExtraCol className="shortcut-list">
								<h5>Shortcuts</h5>
								{Poam.map(recents.poams, poam =>
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

		let report = this.state.report
		if(report.primaryAdvisor) { report.attendees.find(a => a.id === report.primaryAdvisor.id).isPrimary = true; }
		if(report.primaryPrincipal) { report.attendees.find(a => a.id === report.primaryPrincipal.id).isPrimary = true; }
		console.log(report)

		API.send('/api/reports/new', report)
			.then(report => {
				History.push(Report.pathFor(report))
			})
			.catch(response => {
				this.setState({error: response.message})
				window.scrollTo(0, 0)
			})
	}

	@autobind
	addAttendee(newAttendee) {
		let report = this.state.report
		let attendees = report.attendees

		if (!attendees.find(attendee => Person.isEqual(attendee, newAttendee))) {
			let person = new Person(newAttendee)
			attendees.push(person)

			let primaryKey = person.isAdvisor() ? 'primaryAdvisor' : 'primaryPrincipal'
			if (!report[primaryKey]) {
				report[primaryKey] = person
			}
		}

		this.setState({report})
	}

	@autobind
	removeAttendee(oldAttendee) {
		let report = this.state.report
		let attendees = report.attendees
		let index = attendees.findIndex(attendee => Person.isEqual(attendee, oldAttendee))

		if (index !== -1) {
			let person = attendees[index]
			attendees.splice(index, 1)

			let primaryKey = person.isAdvisor() ? 'primaryAdvisor' : 'primaryPrincipal'
			if (Person.isEqual(report[primaryKey], person)) {
				let nextPerson = attendees.find(nextPerson => nextPerson.role === person.role)
				report[primaryKey] = nextPerson
			}

			this.setState({report})
		}
	}

	@autobind
	setPrimaryAttendee(person) {
		let report = this.state.report

		let primaryKey = person.isAdvisor() ? 'primaryAdvisor' : 'primaryPrincipal'
		report[primaryKey] = person

		this.setState({report})
	}

	@autobind
	addMyself() {
		let {currentUser} = this.context.app.state
		this.addAttendee(currentUser)
		this.setPrimaryAttendee(currentUser)
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
