import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table, ListGroup, ListGroupItem} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'

export default class OrganizationShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			organization: {
				id: props.params.id,
				positions: [],
			},
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			organization(id:${props.params.id}) {
				id, name, type
				parentOrg { id, name }
				positions {
					id, name, code
					person { id, name }
					associatedPositions {
						id, name, code
						person { id, name }
					}
				},
				childrenOrgs { id, name }
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization
		let breadcrumbName = org.name || 'Organization'
		let breadcrumbUrl = '/organizations/' + org.id

		let positionsNeedingAttention = org.positions.filter(position => !position.person || !position.code || !position.associatedPositions.length)
		let supportedPositions = org.positions.filter(position => positionsNeedingAttention.indexOf(position) === -1)

		return (
			<div>
				<Breadcrumbs items={[[breadcrumbName, breadcrumbUrl]]} />

				<Form static formFor={org} horizontal>
					<fieldset>
						<legend>{org.name}</legend>

						<Form.Field id="type">
							{org.type && org.type.split('_')[0]}
						</Form.Field>

						{org.parentOrg && <Form.Field id="parentOrg" label="Parent">
							<Link to={`/organizations/${org.parentOrg.id}`}>
								{org.parentOrg.name}
							</Link>
						</Form.Field>}

						{org.childrenOrgs && org.childrenOrgs.length > 0 && <Form.Field id="childrenOrgs" label="Sub-Orgs">
							<ListGroup>
							{org.childrenOrgs.map( org =>
								<ListGroupItem key={org.id} ><Link to={`/organizations/${org.id}`}>{org.name}</Link></ListGroupItem>
							)}
							</ListGroup>
						</Form.Field>}
					</fieldset>

					<fieldset>
						<legend>Positions needing attention</legend>
						{this.renderPositionTable(positionsNeedingAttention)}
					</fieldset>

					<fieldset>
						<legend>Supported laydown</legend>
						{this.renderPositionTable(supportedPositions)}
					</fieldset>
				</Form>
			</div>
		)
	}

	renderPositionTable(positions) {
		return <Table>
			<thead>
				<tr>
					<th>NATO billet</th>
					<th>Advisor</th>
					<th>Afghan billet</th>
					<th>Afghan</th>
				</tr>
			</thead>
			<tbody>
				{positions.map(position =>
					position.associatedPositions.length
					? position.associatedPositions.map(other => this.renderPositionRow(position, other))
					: this.renderPositionRow(position)
				)}
			</tbody>
		</Table>
	}

	renderPositionRow(position, other) {
		let key = position.id
		let otherCodeCol, otherNameCol
		if (other) {
			key += '.' + other.id
			otherCodeCol = <td>
				<Link to={`/positions/${other.id}`}>{other.code || "Uncoded"}</Link>
			</td>

			otherNameCol = other.person
				? <td><Link to={`/people/${other.person.id}`}>{other.person.name}</Link></td>
				: <td className="text-danger">Unfilled</td>
		}

		otherCodeCol = otherCodeCol || <td></td>
		otherNameCol = otherNameCol || <td></td>

		return <tr key={key}>
			<td>
				<Link to={`/positions/${position.id}`}>{position.code || "Uncoded"}</Link>
			</td>

			{position.person
				? <td><Link to={`/people/${position.person.id}`}>{position.person.name}</Link></td>
				: <td className="text-danger">Unfilled</td>
			}

			{otherCodeCol}
			{otherNameCol}
		</tr>
	}
}
