import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'

export default class OrganizationShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			organization: {id: props.params.id},
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
				}
			}
		`).then(data => this.setState({organization: data.organization}))
	}

	render() {
		let org = this.state.organization
		let breadcrumbName = org.name || 'Organization'
		let breadcrumbUrl = '/organizations/' + org.id

		return (
			<div>
				<Breadcrumbs items={[[breadcrumbName, breadcrumbUrl]]} />

				<Form formFor={org} horizontal>
					<fieldset>
						<legend>{org.name}</legend>

						<Form.Field id="type" type="static" label="Org type">
							{org.type && org.type.split('_')[0]}
						</Form.Field>

						<Form.Field id="parentOrg" type="static" label="Parent org">
							{org.parentOrg && <Link to={`/organizations/${org.parentOrg.id}`}>
								{org.parentOrg.name}
							</Link>}
						</Form.Field>
					</fieldset>

					<fieldset>
						<legend>Positions</legend>

						<Table>
							<thead>
								<tr>
									<th>NATO billet</th>
									<th>Advisor</th>
									<th>Afghan billet</th>
									<th>Afghan</th>
								</tr>
							</thead>
							<tbody>
								{org.positions && org.positions.map(position => {
									let other = position.associatedPositions[0] || {person:{}}
									return <tr key={position.id}>
										<td>{position.code}</td>
										<td><Link to={`/people/${position.person.id}`}>{position.person.name}</Link></td>
										<td>{other.code}</td>
										<td><Link to={`/people/${other.person.id}`}>{other.person.name}</Link></td>
									</tr>
								})}
							</tbody>
						</Table>
					</fieldset>
				</Form>
			</div>
		)
	}
}
