import React, {PropTypes} from 'react'
import Page from 'components/Page'
import withHopscotch from 'components/withHopscotch'
import autobind from 'autobind-decorator'

import ReportForm from './Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import NavigationWarning from 'components/NavigationWarning'
import HopscotchLauncher from 'components/HopscotchLauncher'

import {Report} from 'models'

export default withHopscotch(class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props, context) {
		super(props, context)

		this.state = {
			report: new Report(),
			originalReport: new Report(),
		}
	}

	componentDidMount() {
		super.componentDidMount()
		if (this.props.hopscotch.getState() === `${this.props.hopscotchTour.id}:5`) {
			this.startTour()
		}
	}

	@autobind
	startTour() {
		this.props.hopscotch.startTour(this.props.hopscotchTour, 6)
	}

	componentWillUpdate() {
		this.addCurrentUserAsAttendee()
	}

	componentWillMount() {
		this.addCurrentUserAsAttendee()
	}

	addCurrentUserAsAttendee() {
		let newAttendee = this.context.app.state.currentUser

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
					<HopscotchLauncher onClick={this.startTour} />
				</div>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<NavigationWarning original={this.state.originalReport} current={this.state.report} />
				<ReportForm report={this.state.report} title="Create a new Report" />
			</div>
		)
	}
})
