import React from 'react'
import Page from 'components/Page'
import {Link} from 'react-router'
import {Button, Table} from 'react-bootstrap'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'

export default class AdminShow extends Page {
	constructor(props) {
		super(props)
		this.state = {
			settings: [],
			editing: undefined
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			adminSettings(f:getAll) { key, value }
		`).then(data => this.setState({settings: data.adminSettings, editing: undefined}))
	}

	render() {
		let settings = this.state.settings
		let breadcrumbName = 'Admin Settings'
		let breadcrumbUrl = '/admin/'

		return (
			<div>
				<Breadcrumbs items={[[breadcrumbName, breadcrumbUrl]]} />

				<Form static horizontal>
					<fieldset>
						<legend>Settings</legend>

						<Table>
							<thead>
								<tr>
									<th>Key</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
							{settings.map(setting => 
								<tr key={setting.key} >
									<td>{setting.key}</td>
									<td>{setting.value}</td>
									<td>
										<Link to={"/admin/edit?key=" + setting.key} >Edit</Link>
									</td>
								</tr>
							)}
							</tbody>
						</Table>

						<Link to="/admin/edit" ><Button bsStyle="primary" >Edit Settings</Button></Link>
					</fieldset>
				</Form>
			</div>
		)
	}
}
