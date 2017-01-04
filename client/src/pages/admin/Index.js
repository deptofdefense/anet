import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'

export default class AdminIndex extends Page {
	constructor(props) {
		super(props)
		this.state = {
			settings: [],
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			adminSettings(f:getAll) { key, value }
		`).then(data => this.setState({settings: data.adminSettings}))
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['Admin settings', '/admin']]} />

				<Form static horizontal>
					<fieldset>
						<legend>Settings</legend>

						<Table>
							<thead>
								<tr>
									<th>Key</th>
									<th>Value</th>
									<th></th>
								</tr>
							</thead>

							<tbody>
								{this.state.settings.map(setting =>
									<tr key={setting.key} >
										<td>{setting.key}</td>
										<td>{setting.value}</td>
										<td>
											<Link to={`/admin/settings/${setting.key}`}>Edit</Link>
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
}
