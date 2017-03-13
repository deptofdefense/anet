import React, {PropTypes} from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'
import {Table, FormGroup, Col, ControlLabel} from 'react-bootstrap'
import moment from 'moment'
import autobind from 'autobind-decorator'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import ReportTable from 'components/ReportTable'
import LinkTo from 'components/LinkTo'
import History from 'components/History'
import Messages, {setMessages} from 'components/Messages'

import API from 'api'
import {Person} from 'models'

class PersonShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	static modelName = 'User'

	constructor(props) {
		super(props)
		this.state = {
			person: new Person({
				id: props.params.id,
				authoredReports: [],
				attendedReports: [],
			}),
		}
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			person(id:${props.params.id}) {
				id,
				name, rank, role, status, emailAddress, phoneNumber, biography, country, gender, endOfTourDate,
				position {
					id,
					name,
					type,
					organization {
						id, shortName
					},
					associatedPositions {
						id, name,
						person { id, name, rank },
						organization { id, shortName }
					}
				},
				authoredReports(pageNum:0,pageSize:10) { list {
					id,
					engagementDate,
					advisorOrg { id, shortName }
					intent,
					updatedAt,
					author {
						id,
						name
					}
				}},
				attendedReports(pageNum:0, pageSize:10) { list {
					id,
					engagementDate,
					advisorOrg { id, shortName}
					intent,
					updatedAt,
					author {
						id,
						name
					}
				}}

			}
		`).then(data => this.setState({person: new Person(data.person)}))
	}

	render() {
		let {person} = this.state
		let position = person.position

		//User can always edit themselves, or Super Users/Admins.
		let currentUser = this.context.app.state.currentUser
		let canEdit = currentUser && (currentUser.id === person.id ||
			currentUser.isSuperUser())

		return (
			<div>
				<Breadcrumbs items={[[person.name, Person.pathFor(person)]]} />
				<Messages error={this.state.error} success={this.state.success} />

				<Form static formFor={person} horizontal>
					<Fieldset title={`${person.rank} ${person.name}`} action={
						canEdit && <LinkTo person={person} edit button="primary">Edit</LinkTo>
					}>

						<Form.Field id="rank" />

						<Form.Field id="role">
							{person.isAdvisor() ? "NATO Member" : "Principal"}
						</Form.Field>

						<Form.Field id="status" />
						<Form.Field label="Phone" id="phoneNumber" />
						<Form.Field label="Email" id="emailAddress">
							<a href={`mailto:${person.emailAddress}`}>{person.emailAddress}</a>
						</Form.Field>
						<Form.Field id="country" />
						<Form.Field id="gender" />
						<Form.Field label="End of Tour Date" id="endOfTourDate" value={moment(person.endOfTourDate).format('D MMM YYYY')} />
						<Form.Field label="Biography" id="biography" >
							<div dangerouslySetInnerHTML={{__html: person.biography}} />
						</Form.Field>
					</Fieldset>

					<Fieldset title="Position">
						{position && position.id &&
							this.renderPosition(position)
						}
					</Fieldset>

					{person.isAdvisor() &&
						<Fieldset title="Reports authored">
							<ReportTable reports={person.authoredReports.list || []} showAuthors={false} />
						</Fieldset>
					}

					<Fieldset title={`Reports attended by ${person.name}`}>
						<ReportTable reports={person.attendedReports.list || []} showAuthors={true} />
					</Fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === 'edit') {
			History.push(Person.pathForEdit(this.state.person))
		} else {
			console.log('Unimplemented Action: ' + eventKey)
		}
	}

	@autobind
	renderPosition(position) {
		let assocTitle = position.type === 'PRINCIPAL' ? 'Is advised by' : 'Advises'
		return <div>
			<Form.Field id="organization" label="Organization">
				<LinkTo organization={position.organization} />
			</Form.Field>
			<Form.Field id="position" label="Current Position">
				<LinkTo position={position} />
			</Form.Field>

			<FormGroup controlId="counterparts" >
				<Col sm={2} componentClass={ControlLabel}>{assocTitle}</Col>
				<Col sm={7} >
					<Table striped>
						<thead>
							<tr><th>Name</th><th>Position</th><th>Organization</th></tr>
						</thead>
						<tbody>
							{position.associatedPositions.map( assocPos =>
								<tr key={assocPos.id}>
									<td>{assocPos.person && <LinkTo person={assocPos.person} /> }</td>
									<td><LinkTo position={assocPos} /></td>
									<td><LinkTo organization={assocPos.organization} /></td>
								</tr>
							)}
						</tbody>
					</Table>
				</Col>
			</FormGroup>
		</div>
	}
}

export default ModelPage(PersonShow)
