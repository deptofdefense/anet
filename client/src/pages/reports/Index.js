import React from 'react'
import {Table} from 'react-bootstrap'
import {Link} from 'react-router'
import API from '../../api'

export default class ReportsIndex extends React.Component {
	constructor(props) {
		super(props)
		this.state = {reports: []}
	}

	componentDidMount() {
		API.fetch('/reports')
			.then(data => this.setState({reports: data.list}))
	}

	renderTableRow(report) {
		return (
			<tr key={report.id}>
				<td>{report.author.name}</td>
				<td><Link to={{pathname: `/reports/${report.id}`}}>{report.intent}</Link></td>
				<td>{report.state}</td>
				<td>{report.updatedAt}</td>
			</tr>
		)
	}

	render() {
		return (
			<div>
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
						{this.state.reports.map(this.renderTableRow)}
					</tbody>
				</Table>
			</div>
		)
	}
}
