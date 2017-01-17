import React, {PropTypes} from 'react'
import Page from 'components/Page'
import History from 'components/History'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportForm from 'components/ReportForm'
import moment from 'moment'

import API from 'api'
import {Report} from 'models'

export default class ReportEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: PropTypes.object,
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

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				keyOutcomesSummary, keyOutcomes, nextStepsSummary, reportText, nextSteps
				location { id, name},
				attendees {
					id, name, role, primary
					position { id, name }
				}
				poams { id, shortName, longName, responsibleOrg { id, shortName} }
			}
			locations(f:recents) {
				id, name
			}
			persons(f:recents) {
				id, name, rank, role
			}
			poams(f:recents) {
				id, shortName, longName
			}
		`).then(data => {
			let newState = {
				recents: {
					locations: data.locations,
					persons: data.persons,
					poams: data.poams
				},
				report: new Report(data.report)
			}
			newState.report.engagementDate = newState.report.engagementDate && moment(newState.report.engagementDate).format()
			this.setState(newState)
		})
	}

	render() {
		let {report, recents, error} = this.state

		return (
			<div>
				<ContentForHeader>
					<h2>Edit Report #{report.id}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Report #' + report.id, '/reports/' + report.id], ['Edit', "/reports/" + report.id + "/edit"]]} />

				<ReportForm report={report}
					error={error}
					recents={recents}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					submitText="Save report" />
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

		API.send('/api/reports/update', report)
			.then(response => {
				History.push(Report.pathFor(report))
			})
			.catch(response => {
				this.setState({error: response.message || response.error})
				window.scrollTo(0, 0)
			})
	}

}
