import React, {PropTypes} from 'react'
import Page from 'components/Page'

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
		`).then(data => {
			let newState = {
				report: new Report(data.report),
			}
			newState.report.engagementDate = newState.report.engagementDate && moment(newState.report.engagementDate).format()
			this.setState(newState)
		})
	}

	render() {
		let report = this.state.report

		return (
			<div>
				<ContentForHeader>
					<h2>Edit Report #{report.id}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Report #' + report.id, '/reports/' + report.id], ['Edit', "/reports/" + report.id + "/edit"]]} />

				<ReportForm report={report} />
			</div>
		)
	}
}
