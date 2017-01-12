import React from 'react'
import Page from 'components/Page'
import History from 'components/History'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportForm from 'components/ReportForm'

import API from 'api'
<<<<<<< HEAD
import {Report} from 'models'
=======
import {Report, Person} from 'models'
>>>>>>> master

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: React.PropTypes.object,
	}

	constructor(props) {
		super(props)

		this.state = {
			report: new Report(),

			recents: {
				persons: [],
				locations: [],
				poams: [],
			},
		}
	}

	fetchData() {
		API.query(/* GraphQL */`
			locations(f:recents) {
				id, name
			}
			persons(f:recents) {
				id, name, rank, role
			}
			poams(f:recents) {
				id, shortName, longName
			}
		`).then(data => this.setState({recents: data}))
	}

	render() {
		let {report, recents} = this.state
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['EF4', '/organizations/ef4'], ['Submit a report', Report.pathForNew()]]} />

				<ReportForm report={report}
					recents={recents}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					actionText="Save report" />
			</div>
		)
	}

	@autobind
	onChange() {
		let report = this.state.report
		this.setState({report})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let report = this.state.report

		if(report.primaryAdvisor) { report.attendees.find(a => a.id === report.primaryAdvisor.id).isPrimary = true; }
		if(report.primaryPrincipal) { report.attendees.find(a => a.id === report.primaryPrincipal.id).isPrimary = true; }

		delete report.primaryPrincipal
		delete report.primaryAdvisor

		API.send('/api/reports/new', report)
			.then(report => {
				History.push(Report.pathFor(report))
			})
			.catch(response => {
				this.setState({error: response.message})
				window.scrollTo(0, 0)
			})
	}

}
