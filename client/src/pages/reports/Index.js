import React from 'react'

import API from 'api'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportTable from 'components/ReportTable'

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

				<ReportTable reports={this.state.reports} showAuthors={true} />
			</div>
		)
	}
}
