import React, {PropTypes} from 'react'
import HopscotchPage from 'components/HopscotchPage'

import ReportForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import NavigationWarning from 'components/NavigationWarning'
import {Report} from 'models'

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
			this.hopscotch.startTour(this.hopscotchTour, 4)
		}
	}

	componentWillReceiveProps(_, nextContext) {
		let newAttendee = this.context.app.state.currentUser

		this.state.report.addAttendee(newAttendee)
		this.state.originalReport.addAttendee(newAttendee)
		this.setState()
	}

	render() {
		let currentUser = this.context.app.state.currentUser

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<NavigationWarning original={this.state.originalReport} current={this.state.report} />
				<ReportForm report={this.state.report} />
			</div>
		)
	}
}
