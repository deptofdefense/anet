import React from 'react'
import {Table} from 'react-bootstrap'
import {Link} from 'react-router'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'

import moment from 'moment'

export default class ReportsIndex extends React.Component {
	constructor(props) {
		super(props)
		this.state = {reports: []}
	}

	componentDidMount() {
		API.query(`
			reports(f:getAll, pageSize:100, pageNum:0) {
				id, intent, state
				author {
					name
				}
			}
		`).then(data => this.setState({reports: data.reports}))
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['My reports', '/reports']]} />

				<Table striped>
					<thead>
						<tr>
							<th>Reporter</th>
							<th>Summary</th>
							<th>Status</th>
							<th>Last updated</th>
						</tr>
					</thead>

					<tbody>
						{this.state.reports.map(report =>
							<tr key={report.id}>
								<td>{report.author && report.author.name}</td>
								<td><Link to={"/reports/" + report.id}>{report.intent}</Link></td>
								<td>{report.state}</td>
								<td>{moment(report.updatedAt).fromNow()}</td>
							</tr>
						)}
					</tbody>
				</Table>
			</div>
		)
	}
}
