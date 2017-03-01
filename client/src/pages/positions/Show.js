import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table, DropdownButton, MenuItem} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import Messages , {setMessages} from 'components/Messages'
import autobind from 'autobind-decorator'
import {browserHistory as History} from 'react-router'
import LinkTo from 'components/LinkTo'
import NotFound from 'components/NotFound'
import moment from 'moment'
import _includes from 'lodash.includes'

import {Person, Position, Organization} from 'models'

export default class PositionShow extends Page {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			position: new Position( {
				id: props.params.id,
				previousPeople: []
			}),
		}
		setMessages(props,this.state)
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			position(id:${props.params.id}) {
				id, name, type, code,
				organization { id, shortName, longName },
				person { id, name, rank },
				associatedPositions {
					id, name,
					person { id, name }
				},
				previousPeople { startTime, endTime, person { id, name, rank }}
				location { id, name }
			}
		`).then(data => {
				PositionShow.pageProps = {fluidContainer: false}
				this.setState({position: new Position(data.position)})
			}, 
			err => {
				if (_includes([
					'Exception while fetching data: javax.ws.rs.WebApplicationException: Not Found',
					'Invalid Syntax'
				], err.errors[0])) {
					PositionShow.pageProps = {fluidContainer: true, useNavigation: false}
					this.setState({position: null})
				}	
			})
	}

	render() {
		let position = this.state.position

		if (!position) {
			return <NotFound text={`Position with ID ${this.props.params.id} not found.`} />
		}

		let assignedRole = (position.type === 'ADVISOR') ? 'Afghan Principals' : 'Advisors'

		let currentUser = this.context.app.state.currentUser
		let canEdit = currentUser && (
			//Super Users can edit any Principal
			(currentUser.isSuperUser() && position.type === 'PRINCIPAL') ||
			//Admins can edit anybody
			(currentUser.isAdmin()) ||
			//Super users can edit positions within their own organization
			(position.organization && position.organization.id && currentUser.isSuperUserForOrg(position.organization)))
		return (
			<div>
				<Breadcrumbs items={[[position.name || 'Position', Position.pathFor(position)]]} />
				<Messages success={this.state.success} error={this.state.error} />

				{canEdit &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" onSelect={this.actionSelect}>
							<MenuItem eventKey="edit" >Edit Position</MenuItem>
						</DropdownButton>
					</div>
				}


				<Form static formFor={position} horizontal>
					<fieldset>
						<legend>
							{position.name}
						</legend>

						<Form.Field id="code" />
						<Form.Field id="type" />

						{position.organization && <Form.Field id="organization" label="Organization" value={position.organization && position.organization.shortName} >
							<Link to={Organization.pathFor(position.organization)}>
								{position.organization.shortName} {position.organization.longName}
							</Link>
						</Form.Field>}

						<Form.Field id="location" label="Location">
							{position.location && <LinkTo location={position.location}>{position.location.name}</LinkTo>}
						</Form.Field>

						{position.person && <Form.Field id="person" label="Current Assigned Person" value={position.person && position.person.name} >
							<Link to={Person.pathFor(position.person)}>
								{position.person.rank} {position.person.name}
							</Link>
						</Form.Field>}

					</fieldset>

					<fieldset>
						<legend>Assigned {assignedRole}</legend>

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Position</th>
								</tr>
							</thead>
							<tbody>
							{Position.map(position.associatedPositions, (pos, idx) =>
								this.renderAssociatedPositionRow(pos, idx)
							)}
							</tbody>
						</Table>
					</fieldset>

					<fieldset>
						<legend>Previous Position Holders</legend>

						<Table>
							<thead>
								<tr>
									<th>Name</th>
									<th>Dates</th>
								</tr>
							</thead>
							<tbody>
								{position.previousPeople.map( (pp, idx) =>
									<tr key={pp.person.id} id={`previousPerson_${idx}`}>
										<td><LinkTo person={pp.person} /></td>
										<td>
											{moment(pp.startTime).format('D MMM YYYY')} - &nbsp;
											{pp.endTime && moment(pp.endTime).format('D MMM YYYY')}
										</td>
									</tr>
								)}
							</tbody>
						</Table>
					</fieldset>
				</Form>
			</div>
		)
	}

	renderAssociatedPositionRow(pos, idx) {
		let personName = 'Unfilled'
		if (pos.person) {
			personName = <Link to={Person.pathFor(pos.person)}>{pos.person.name}</Link>
		}
		return <tr key={pos.id} id={`associatedPosition_${idx}`}>
			<td>{personName}</td>
			<td><Link to={Position.pathFor(pos)}>{pos.name}</Link></td>
		</tr>
	}

	@autobind
	actionSelect(eventKey, event) {
		let position = this.state.position
		if (eventKey === 'edit') {
			History.push(Position.pathForEdit(position))
		} else {
			console.error('Unimplemented Action: ' + eventKey)
		}
	}

}
