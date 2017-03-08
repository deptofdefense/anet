import React, {PropTypes} from 'react'
import HopscotchPage from 'components/HopscotchPage'
import {Grid, Row, Col, FormControl, FormGroup, ControlLabel, Button} from 'react-bootstrap'
import SavedSearchTable from 'components/SavedSearchTable'
import {Link} from 'react-router'
import moment from 'moment'
import Messages from 'components/Messages'

import Breadcrumbs from 'components/Breadcrumbs'
import API from 'api'
import autobind from 'autobind-decorator'

export default class Home extends HopscotchPage {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	constructor(props) {
		super(props)
		this.state = {
			pendingMe: null,
			myOrgToday: null,
			myReportsToday: null,
			upcomingEngagements: null,
			savedSearches: [],
			selectedSearch: null,
			showGettingStartedPanel: window.localStorage.showGettingStartedPanel
		}
	}

	fetchData() {
		let currentUser = this.context.app.state.currentUser
		let yesterday = moment().subtract(1, 'days').valueOf()

		let futureQuery = {
			engagementDateStart: moment().add(1, 'days').hour(0).valueOf()
		}
		let orgQuery = (currentUser.position && currentUser.position.organization && {
			authorOrgId: currentUser.position.organization.id,
			createdAtStart: yesterday,
			state: ["RELEASED","CANCELLED","PENDING_APPROVAL"]
		}) || {}
		let pendingQuery = currentUser.isSuperUser() ?
			{pendingApprovalOf : currentUser.id}
			:
			{authorId : currentUser.id, state : ['PENDING_APPROVAL']}
		let myReports = { authorId: currentUser.id, createdAtStart: moment().subtract(1, 'days').valueOf() }
		API.query(/*GraphQL */`
			pendingMe: reportList(f:search, query:$pendingQuery) { totalCount },
			myOrg: reportList(f:search, query:$orgQuery) { totalCount },
			myReports: reportList(f:search, query:$myReports) { totalCount},
			savedSearches: savedSearchs(f:mine) {id, name, objectType, query}
			upcomingEngagements: reportList(f:search, query: $futureQuery) { totalCount }
		`, {futureQuery, pendingQuery, orgQuery, myReports},
			'($futureQuery: ReportSearchQuery, $pendingQuery: ReportSearchQuery,  '
			+ '$orgQuery: ReportSearchQuery, $myReports: ReportSearchQuery)')
		.then(data => {
			let selectedSearch = data.savedSearches && data.savedSearches.length > 0 ? data.savedSearches[0] : null
			this.setState({
				pendingMe: data.pendingMe,
				myOrgToday: data.myOrg,
				myReportsToday: data.myReports,
				savedSearches: data.savedSearches,
				upcomingEngagements: data.upcomingEngagements,
				selectedSearch: selectedSearch
			})
		})
	}

	render() {
		let {pendingMe, myOrgToday, myReportsToday, upcomingEngagements} = this.state
		let currentUser = this.context.app.state.currentUser
		let org = currentUser && currentUser.position && currentUser.position.organization
		let yesterday = moment().subtract(1, 'days').valueOf()

		return (
			<div>
				<Breadcrumbs />
				<Messages error={this.state.error} success={this.state.success} />

				{this.state.showGettingStartedPanel === 'true' &&
					<fieldset className="home-tile-row">
						<legend>Getting Started</legend>
						<Grid fluid className="getting-started-grid">
							<Row>
								<h3>Welcome to ANET!</h3>
							</Row>
							<Row>
								<Col xs={6}>
									<p>Not sure where things are?</p>
									<a onClick={this.startWelcomeTour}>Take a guided tour</a>
								</Col>
								<Col xs={6}>
									<p>Still having trouble?</p>
									<a href="mailto:todo.what.is.the.real.address@dds.mil">Contact the ANET Team</a>
								</Col>
							</Row>
							<Row>
								<Button bsStyle="primary" onClick={this.onDismissGettingStarted}>Dismiss</Button>
							</Row>
						</Grid>
					</fieldset>
				}
				<fieldset className="home-tile-row">
					<legend>My ANET Snapshot</legend>
					<Grid fluid>
						<Row>
							<Link to={{pathname: '/search', query: {type: 'reports', pendingApprovalOf: currentUser.id}}} className="col-md-3 home-tile">
								<h1>{pendingMe && pendingMe.totalCount}</h1>
								{currentUser.isSuperUser() ? 'Pending my approval' : 'My reports pending approval' }
							</Link>

							{org &&
								<Link to={{pathname: '/search', query: {type: 'reports', authorOrgId: org.id, createdAtStart: yesterday,state: ["RELEASED","CANCELLED","PENDING_APPROVAL"] }}} className="col-md-3 home-tile">
									<h1>{myOrgToday && myOrgToday.totalCount}</h1>
									{org.shortName}'{org.shortName[org.shortName.length - 1].toLowerCase() !== 's' && 's'} recent reports
								</Link>
							}

							<Link to={{pathname: '/search', query: {type: 'reports', authorId: currentUser.id, createdAtStart: yesterday}}} className="col-md-3 home-tile">
								<h1>{myReportsToday && myReportsToday.totalCount}</h1>
								My reports in last 24 hrs
							</Link>

							<Link to={{pathname: '/search', query: {type: 'reports', pageSize: 100, engagementDateStart: moment().add(1, 'days').hour(0).valueOf()}}} className="col-md-3 home-tile">
								<h1>{upcomingEngagements && upcomingEngagements.totalCount}</h1>
								Upcoming engagements
							</Link>
						</Row>
					</Grid>
				</fieldset>

				<fieldset>
					<legend>Saved searches</legend>
					<FormGroup controlId="savedSearchSelect">
						<ControlLabel>Select a saved search</ControlLabel>
						<FormControl componentClass="select" onChange={this.onSaveSearchSelect}>
							{this.state.savedSearches && this.state.savedSearches.map( savedSearch =>
								<option value={savedSearch.id} key={savedSearch.id}>{savedSearch.name}</option>
							)}
						</FormControl>
					</FormGroup>

					{this.state.selectedSearch &&
						<div>
							<div className="pull-right">
								<Button bsStyle="danger" bsSize="small" onClick={this.deleteSearch} >
									Delete Search
								</Button>
							</div>
							<SavedSearchTable search={this.state.selectedSearch} />
						</div>
					}
				</fieldset>
			</div>
		)
	}

	@autobind
	onSaveSearchSelect(event) {
		let id = event && event.target ? event.target.value : event
		let search = this.state.savedSearches.find(el => Number(el.id) === Number(id))
		this.setState({selectedSearch: search})
	}

	@autobind
	deleteSearch() {
		let search = this.state.selectedSearch
		let index = this.state.savedSearches.findIndex(s => s.id === search.id)
		if (confirm("Are you sure you want to delete '" + search.name + "'?")) {
			API.send(`/api/savedSearches/${search.id}`, {}, {method: 'DELETE'})
				.then(data => {
					let savedSearches = this.state.savedSearches
					savedSearches.splice(index, 1)
					let nextSelect = savedSearches.length > 0 ? savedSearches[0] : null
					this.setState({ savedSearches: savedSearches, selectedSearch : nextSelect })
				}, data => {
					this.setState({success:null, error: data})
				})
		}
	}


	@autobind
	onDismissGettingStarted() {
		window.localStorage.showGettingStartedPanel = 'false'
		this.setState({showGettingStartedPanel: 'false'})
	}

	@autobind
	startWelcomeTour() {		
		this.hopscotch.endTour()
		this.hopscotch.startTour(this.hopscotchTour)
	}
}
