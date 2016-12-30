import React, {Component} from 'react'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'

import moment from 'moment'

export default class ReportTable extends Component {
	static propTypes = {
		showAuthors: React.PropTypes.bool,
		reports: React.PropTypes.array.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			reports: []
		}
	}

	render() {
		let {showAuthors} = this.props

		return <Table striped>
			<thead>
				<tr>
					{showAuthors && <th>Author</th>}
					<th>AO</th>
					<th>Summary</th>
					<th>Status</th>
					<th>Last updated</th>
				</tr>
			</thead>

			<tbody>
				{this.props.reports.map(report =>
					<tr key={report.id}>
						{showAuthors && <td><Link to={"/people/" + report.author.id}>{report.author.name}</Link></td>}
						<td>{report.organization && <Link to={"/organizations/" + report.organization.id}></Link>}</td>
						<td><Link to={"/reports/" + report.id}>{report.intent}</Link></td>
						<td>{report.state}</td>
						<td>{moment(report.updatedAt).fromNow()}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}
}
