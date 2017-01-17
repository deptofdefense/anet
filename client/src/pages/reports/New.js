import React, {PropTypes} from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportForm from 'components/ReportForm'

import {Report} from 'models'

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props, context) {
		super(props)

		this.state = {
			report: new Report(),
			currentUser: null
		}
	}

	//use this to auto add the author to the report attendees
	componentWillReceiveProps(nextProps, nextContext) {
		this.tryToAddAuthor()
	}

	componentDidMount() {
		super.componentDidMount()
		this.tryToAddAuthor()
	}

	@autobind
	tryToAddAuthor() {
		let currUser = this.state.currentUser
		let newUser = this.context.app.state && this.context.app.state.currentUser

		let currUserId = currUser && currUser.id
		let newUserId = newUser && newUser.id

		if (newUserId && newUserId !== currUserId) {
			console.log('updating', currUser, newUser);
			let report = this.state.report
			newUser.primary = true
			report.attendees.push(newUser)
			this.setState({report: report})
		} else {
			console.log('notUpdating', currUser, newUser);
		}

	}

	render() {
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />

				<ReportForm report={this.state.report} />
			</div>
		)
	}
}
