import React, {PropTypes} from 'react'
import Page from 'components/Page'
import ModelPage from 'components/ModelPage'
import moment from 'moment'

import ReportForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import NavigationWarning from 'components/NavigationWarning'

import API from 'api'
import {Report} from 'models'

class ReportEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	static modelName = 'Report'

	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props) {
		super(props)

		this.state = {
			report: new Report(),
			originalReport: new Report(),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				keyOutcomes, reportText, nextSteps, cancelledReason,
				location { id, name},
				attendees {
					id, name, role, primary
					position { id, name }
				}
				poams { id, shortName, longName, responsibleOrg { id, shortName} }
			}
		`).then(data => {
			function getReportFromData() {
				const report = new Report(data.report)
				report.engagementDate = report.engagementDate && moment(report.engagementDate).format()
				return report
			}
			this.setState({report: getReportFromData(), originalReport: getReportFromData()})
		})
	}

	render() {
		let report = this.state.report

		return (
			<div>
				<ContentForHeader>
					<h2>Edit Report #{report.id}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Report #' + report.id, '/reports/' + report.id], ['Edit', '/reports/' + report.id + '/edit']]} />

				<NavigationWarning original={this.state.originalReport} current={report} />
				<ReportForm edit report={report} />
			</div>
		)
	}
}

export default ModelPage(ReportEdit)
