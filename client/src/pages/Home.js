import React, {PropTypes} from 'react'
import HopscotchPage from 'components/HopscotchPage'
import {Grid, Row, Col, FormControl, FormGroup, ControlLabel, Button} from 'react-bootstrap'
import SavedSearchTable from 'components/SavedSearchTable'
import {Link} from 'react-router'
import moment from 'moment'
import Messages from 'components/Messages'
import HopscotchLauncher from 'components/HopscotchLauncher'

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
			tileCounts: [],
			savedSearches: [],
			selectedSearch: null,
			showGettingStartedPanel: window.localStorage.showGettingStartedPanel
		}
	}

	adminQueries(currentUser) {
		return [ this.allDraft(), this.allPending(), this.pendingMe(currentUser), this.allUpcoming() ]
	}

	approverQueries(currentUser) {
		return [ this.pendingMe(currentUser), this.myDraft(currentUser), this.myOrgRecent(currentUser), this.myOrgFuture(currentUser) ]
	}

	advisorQueries(currentUser) {
		return [ this.myDraft(currentUser), this.myPending(currentUser), this.myOrgRecent(currentUser), this.myOrgFuture(currentUser) ]
	}

	allDraft() { return {
		title: "All draft reports",
		query: { state: ["DRAFT"] }
	}}

	myDraft(currentUser) {
		return {
			title: "My draft reports",
			query: { state: ["DRAFT"], authorId: currentUser.id }
		}
	}

	myPending(currentUser) {
		return {
			title: "My reports pending approval",
			query: { authorId: currentUser.id, state: ["PENDING_APPROVAL"]}
		}
	}

	pendingMe(currentUser) {
		return {
			title: "Reports pending my approval",
			query: { pendingApprovalOf: currentUser.id }
		}
	}

	allPending() {
		return {
			title: "All reports pending approval",
			query: { state: ["PENDING_APPROVAL"] }
		}
	}

	myOrgRecent(currentUser) {
		if (!currentUser.position || !currentUser.position.organization) { return { query: {}} }
		let lastWeek = moment().subtract(7, 'days').startOf('day').valueOf()
		return {
			title: currentUser.position.organization.shortName + "'s reports in the last 7 days",
			query: {
				authorOrgId: currentUser.position.organization.id,
				createdAtStart: lastWeek,
				state: ["RELEASED", "CANCELLED", "PENDING_APPROVAL"]
			}
		}
	}

	myOrgFuture(currentUser) {
		if (!currentUser.position || !currentUser.position.organization) { return { query: {}} }
		let start = moment().endOf('day').valueOf()
		return {
			title: currentUser.position.organization.shortName + "'s upcoming engagements",
			query: {
				authorOrgId: currentUser.position.organization.id,
				engagementDateStart: start
			}
		}
	}

	allUpcoming() {
		return {
			title: "All upcoming engagements",
			query: { engagementDateStart: moment().endOf('day').valueOf() }
		}
	}

	getQueriesForUser() {
		let user = this.context.app.state.currentUser
		if (user.isAdmin()) {
			return this.adminQueries(user)
		} else if (user.position && user.position.isApprover) {
			return this.approverQueries(user)
		} else {
			return this.advisorQueries(user)
		}
	}

	fetchData() {
		//If we don't have the currentUser yet (ie page is still loading, don't run these queries)
		let currentUser = this.context.app.state.currentUser
		if (!currentUser || !currentUser._loaded) { return }

		//queries will contain the four queries that will show up on the home tiles
		//Based on the users role. They are all report searches
		let queries = this.getQueriesForUser()
		//Run those four queries
		let graphQL = /* GraphQL */`
			tileOne: reportList(f:search, query:$queryOne) { totalCount},
			tileTwo: reportList(f:search, query: $queryTwo) { totalCount},
			tileThree: reportList(f:search, query: $queryThree) { totalCount },
			tileFour: reportList(f:search, query: $queryFour) { totalCount },
			savedSearches: savedSearchs(f:mine) {id, name, objectType, query}`
		let variables = {
			queryOne: queries[0].query,
			queryTwo: queries[1].query,
			queryThree: queries[2].query,
			queryFour: queries[3].query
		}

		API.query(graphQL, variables,
			"($queryOne: ReportSearchQuery, $queryTwo: ReportSearchQuery, $queryThree: ReportSearchQuery, $queryFour: ReportSearchQuery)")
		.then(data => {
			let selectedSearch = data.savedSearches && data.savedSearches.length > 0 ? data.savedSearches[0] : null
			this.setState({
				tileCounts: [data.tileOne.totalCount, data.tileTwo.totalCount, data.tileThree.totalCount, data.tileFour.totalCount],
				savedSearches: data.savedSearches,
				selectedSearch: selectedSearch
			})
		})
	}

	render() {
		let queries = this.getQueriesForUser()

		return (
			<div>
				<Breadcrumbs />
				<Messages error={this.state.error} success={this.state.success} />

				{this.state.showGettingStartedPanel === 'true' &&
					<div>
					<h2 className="form-header">Getting Started</h2>
					<fieldset className="home-tile-row">
						<Grid fluid className="getting-started-grid">
							<span className="close-getting-started" onClick={this.onDismissGettingStarted}>Close ✕</span>
							<Row>
								<h3>Welcome to ANET!</h3>
							</Row>
							<Row>
								<Col xs={12}>
									<p>Get started with a self-guided tour.</p>
								</Col>
							</Row>
							<Row>
								<Col xs={12}>
									<Button bsStyle="primary" onClick={this.startWelcomeTour}>Take the tour</Button>
								</Col>
							</Row>
						</Grid>
					</fieldset>
					</div>
				}
				<h2 className="form-header">
					My ANET Snapshot
					{ this.state.showGettingStartedPanel !== 'true' &&
						<div className="pull-right" ><HopscotchLauncher onClick={this.startWelcomeTour} /></div>
					}
				</h2>
				<fieldset className="home-tile-row">
					<Grid fluid>
						<Row>
							{queries.map((query, index) =>{
								query.query.type = "reports"
								return <Link to={{pathname: '/search', query: query.query, }} className="col-md-3 home-tile" key={index}>
									<h1>{this.state.tileCounts[index]}</h1>
									{query.title}
								</Link>
							})}
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
