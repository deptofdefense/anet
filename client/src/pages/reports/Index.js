import React from 'react'
import Page from 'components/Page'

import Breadcrumbs from 'components/Breadcrumbs'
import ReportTable from 'components/ReportTable'

import API from 'api'
import {Report} from 'models'

export default class ReportsIndex extends Page {
	constructor(props) {
		super(props)
		this.state = {reports: []}
	}

	fetchData() {
		API.query(/* GraphQL */`
			reports(f:getAll, pageSize:100, pageNum:0) {
				id, intent, state
				author {
					id
					name
				}
			}
		`).then(data => this.setState({reports: Report.fromArray(data.reports)}))
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['My reports', '/reports']]} />
				<ReportTable reports={this.state.reports} showAuthors={true} showStatus={true}/>
			</div>
		)
	}
}
