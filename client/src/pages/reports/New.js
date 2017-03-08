import React, {PropTypes} from 'react'
import HopscotchPage from 'components/HopscotchPage'

import ReportForm from './Form'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
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
		}
	}

	componentDidMount() {
		super.componentDidMount()
		if (this.hopscotch.getState() === `${this.hopscotchTour.id}:3`) {
			this.hopscotch.startTour(this.hopscotchTour, 4)
		}
	}

	render() {
		let currentUser = this.context.app.state.currentUser

		return (
			<div>
				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<ReportForm report={this.state.report} defaultAttendee={currentUser} title="Create a new Report" />
			</div>
		)
	}
}
