import React, {PropTypes} from 'react'
import HopscotchPage from 'components/HopscotchPage'
import HopscotchLauncher from 'components/HopscotchLauncher'
import {Row, Col} from 'react-bootstrap'

import ReportForm from './Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import NavigationWarning from 'components/NavigationWarning'
import {Report} from 'models'
import autobind from 'autobind-decorator'

export default class ReportNew extends HopscotchPage {
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
		if (this.hopscotch.getState() === `${this.hopscotchTour.id}:3`) {
			this.startTour()
		}
	}

	@autobind
	startTour() {
		this.hopscotch.startTour(this.hopscotchTour, 4)
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
				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<NavigationWarning original={this.state.originalReport} current={this.state.report} />
				<Row className="hopscotch-launcher-row">
					<Col xs={12}>
						<HopscotchLauncher onClick={this.startTour} />
					</Col>
				</Row>
				<ReportForm report={this.state.report} title="Create a new Report" />
			</div>
		)
	}
}
