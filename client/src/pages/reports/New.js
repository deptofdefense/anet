import React from 'react'
import Page from 'components/Page'
import History from 'components/History'
import autobind from 'autobind-decorator'

import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportForm from 'components/ReportForm'

import API from 'api'
import {Report} from 'models'

export default class ReportNew extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: React.PropTypes.object,
	}

	constructor(props, context) {
		super(props)

		this.state = {
			report: new Report(),

			recents: {
				persons: [],
				locations: [],
				poams: [],
			},
			currentUser: null
		}
	}

	fetchData() {
		API.query(/* GraphQL */`
			locations(f:recents) {
				id, name
			}
			persons(f:recents) {
				id, name, rank, role
			}
			poams(f:recents) {
				id, shortName, longName
			}
		`).then(data => this.setState({recents: data}))
	}

	//use this to auto add the author to the report attendees
	componentWillReceiveProps(nextProps, nextContext) {
		this.tryToAddAuthor()
	}

	componentDidMount() {
		this.fetchData(this.props)
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
		let {report, recents} = this.state
		return (
			<div>
				<ContentForHeader>
					<h2>Create a new Report</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Submit a report', Report.pathForNew()]]} />

				<ReportForm report={report}
					recents={recents}
					onChange={this.onChange}
					onSubmit={this.onSubmit}
					error={this.state.error}
					actionText="Save report" />
			</div>
		)
	}

	@autobind
	onChange() {
		let report = this.state.report
		this.setState({report})
	}

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		let report = this.state.report

		if(report.primaryAdvisor) { report.attendees.find(a => a.id === report.primaryAdvisor.id).isPrimary = true; }
		if(report.primaryPrincipal) { report.attendees.find(a => a.id === report.primaryPrincipal.id).isPrimary = true; }

		delete report.primaryPrincipal
		delete report.primaryAdvisor

		API.send('/api/reports/new', report)
			.then(report => {
				History.push(Report.pathFor(report))
				window.scrollTo(0, 0)
			})
			.catch(response => {
				this.setState({error: response.message})
				window.scrollTo(0, 0)
			})
	}

}
