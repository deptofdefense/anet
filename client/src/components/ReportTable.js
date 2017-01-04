import React, {Component} from 'react'
import {Link} from 'react-router'
import {Table} from 'react-bootstrap'

import {Report, Person, Organization} from 'models'

import moment from 'moment'

export default class ReportTable extends Component {
	static propTypes = {
		showAuthors: React.PropTypes.bool,
		reports: React.PropTypes.array.isRequired,
	}

	render() {
		let {showAuthors} = this.props
		let reports = Report.fromArray(this.props.reports)

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
				{reports.map(report =>
					<tr key={report}>
						{showAuthors && <td><Link to={Person.pathFor(report.author)}>{report.author.name}</Link></td>}
						<td>{report.organization && <Link to={Organization.pathFor(report.organization)}>{report.organization.name}</Link>}</td>
						<td><Link to={Report.pathFor(report)}>{report.intent}</Link></td>
						<td>{report.state}</td>
						<td>{moment(report.updatedAt).fromNow()}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}
}
