import React, {PropTypes} from 'react'
import Page from 'components/Page'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import ReportForm from 'components/ReportForm'
import autobind from 'autobind-decorator'
import {Report, Person} from 'models'

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
			hasAddedAuthor: false
		}

		this.addMyself();
	}

	componentWillReceiveProps() {
		this.addMyself()
	}

	render() {
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />
				<Messages error={this.state.error} />

				<ReportForm report={this.state.report} />
			</div>
		)
	}

	@autobind
	addMyself() {
		let {currentUser} = this.context.app.state
		if (currentUser && currentUser.id && (!this.state.hasAddedAuthor)) {
			let report = this.state.report;
			let attendee = new Person(currentUser)
			attendee.primary = true
			let attendees = report.attendees.slice()
			attendees.push(attendee)
			report.attendees = attendees;
			this.setState({report: report, hasAddedAuthor: true});
		}
	}


}
