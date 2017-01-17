import React, {Component, PropTypes} from 'react'
import {Table} from 'react-bootstrap'

import LinkTo from 'components/LinkTo'
import {Report} from 'models'

import moment from 'moment'

export default class ReportTable extends Component {
	static propTypes = {
		showAuthors: PropTypes.bool,
		reports: PropTypes.array.isRequired,
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
					<tr key={report.id}>
						{showAuthors && <td><LinkTo person={report.author} /></td>}
						<td>{<LinkTo organization={report.advisorOrg} />}</td>
						<td>{<LinkTo report={report} />}</td>
						<td>{report.state}</td>
						<td>{moment(report.updatedAt).fromNow()}</td>
					</tr>
				)}
			</tbody>
		</Table>
	}
}
