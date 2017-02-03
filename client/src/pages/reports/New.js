import React, {PropTypes} from 'react'
import Page from 'components/Page'

import ReportForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import {Report} from 'models'

export default class ReportNew extends Page {
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

	render() {
		let currentUser = this.context.app.state.currentUser

		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<ReportForm report={this.state.report} defaultAttendee={currentUser} />
			</div>
		)
	}
}
