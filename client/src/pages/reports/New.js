import React, {PropTypes} from 'react'
import Page from 'components/Page'

import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import NavigationWarning from 'components/NavigationWarning'

import ReportForm from './Form'

import GuidedTour from 'components/GuidedTour'
import {reportTour} from 'pages/HopscotchTour'

import {Report} from 'models'

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false,
	}

	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	constructor(props, context) {
		super(props, context)

		this.state = {
			report: new Report(),
			originalReport: new Report(),
		}
	}

	componentWillUpdate() {
		this.addCurrentUserAsAttendee()
	}

	componentWillMount() {
		this.addCurrentUserAsAttendee()
	}

	addCurrentUserAsAttendee() {
		let newAttendee = this.context.currentUser

		const addedAttendeeToReport = this.state.report.addAttendee(newAttendee)
		const addedAttendeeToOriginalReport = this.state.originalReport.addAttendee(newAttendee)

		if (addedAttendeeToReport || addedAttendeeToOriginalReport) {
			this.forceUpdate()
		}
	}

	render() {
		return (
			<div className="report-new">
				<div className="pull-right">
					<GuidedTour
						tour={reportTour}
						autostart={localStorage.newUser === 'true' && localStorage.hasSeenReportTour !== 'true'}
						onEnd={() => localStorage.hasSeenReportTour = 'true'}
					/>
				</div>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<NavigationWarning original={this.state.originalReport} current={this.state.report} />
				<ReportForm report={this.state.report} title="Create a new Report" />
			</div>
		)
	}
}
