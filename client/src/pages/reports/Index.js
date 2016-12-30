import React, {Component} from 'react'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportTable from 'components/ReportTable'

export default class ReportsIndex extends Component {
	constructor(props) {
		super(props)
		this.state = {reports: []}
	}

	componentDidMount() {
		API.query(/* GraphQL */`
			reports(f:getAll, pageSize:100, pageNum:0) {
				id, intent, state
				author {
					id
					name
				}
			}
		`).then(data => this.setState({reports: data.reports}))
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['My reports', '/reports']]} />
				<ReportTable reports={this.state.reports} showAuthors={true} />
			</div>
		)
	}
}
