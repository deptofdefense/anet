import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Grid, Row, Col, FormControl, FormGroup, ControlLabel} from 'react-bootstrap'
import SavedSearchTable from 'components/SavedSearchTable'
import {Link} from 'react-router'
import moment from 'moment'

import Breadcrumbs from 'components/Breadcrumbs'
import API from 'api'
import autobind from 'autobind-decorator'

export default class Home extends Page {
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
			selectedSearchId: null
		}
	}

	fetchData() {
		let futureQuery = { engagementDateStart: moment().add(1, 'days').hour(0).valueOf() }
		API.query(/*GraphQL */`
			pendingMe: reportList(f:pendingMyApproval) { totalCount },
			myOrg: reportList(f:myOrgToday) { totalCount },
			myReports: reportList(f:myReportsToday) { totalCount},
			savedSearches: savedSearchs(f:mine) {id, name}
			upcomingEngagements: reportList(f:search, query: $futureQuery) { totalCount }
		`, {futureQuery}, "($futureQuery: ReportSearchQuery)")
		.then(data => {
			let selectedSearchId = data.savedSearches && data.savedSearches.length > 0 ? data.savedSearches[0].id : null;
			this.setState({
				pendingMe: data.pendingMe,
				myOrgToday: data.myOrg,
				myReportsToday: data.myReports,
				savedSearches: data.savedSearches,
				upcomingEngagements: data.upcomingEngagements,
				selectedSearchId: selectedSearchId
			});
		})
	}

	render() {
		let {pendingMe, myOrgToday, myReportsToday, upcomingEngagements} = this.state
		let currentUser = this.context.app.state.currentUser;
		let org = currentUser && currentUser.position && currentUser.position.organization

		return (
			<div>
				<Breadcrumbs />

				<fieldset className="home-tile-row">
					<legend>My ANET Snapshot</legend>
					<Grid fluid>
						<Row>
							<Link to={"/search?type=reports&pendingApprovalOf=" + currentUser.id} className="col-md-3 home-tile">
								<h1>{pendingMe && pendingMe.totalCount}</h1>
								Pending my approval
							</Link>

							{org &&
								<Link to={"/search?type=reports&authorOrgId=" + org.id} className="col-md-3 home-tile">
									<h1>{myOrgToday && myOrgToday.totalCount}</h1>
									{org.shortName}'{org.shortName[org.shortName.length - 1].toLowerCase() !== 's' && 's'} recent reports
								</Link>
							}

							<Link to={"/search?type=reports&authorId=" + currentUser.id} className="col-md-3 home-tile">
								<h1>{myReportsToday && myReportsToday.totalCount}</h1>
								My reports in last 24 hrs
							</Link>

							<Link to={"/search?type=reports&pageSize=100&engagementDateStart=" + moment().add(1, 'days').hour(0).valueOf()} className="col-md-3 home-tile">
								<h1>{upcomingEngagements && upcomingEngagements.totalCount}</h1>
								Upcoming engagements
							</Link>
						</Row>
					</Grid>
				</fieldset>

				<fieldset>
					<legend>Subscribed Searches</legend>
					<FormGroup controlId="savedSearchSelect">
						<ControlLabel>Select a Saved Search</ControlLabel>
						<FormControl componentClass="select" onChange={this.onSaveSearchSelect}>
							{this.state.savedSearches && this.state.savedSearches.map( savedSearch =>
								<option value={savedSearch.id} key={savedSearch.id}>{savedSearch.name}</option>
							)}
						</FormControl>
					</FormGroup>

					{this.state.selectedSearchId &&
						<SavedSearchTable searchId={this.state.selectedSearchId} />
					}
				</fieldset>
			</div>
		)
	}

	@autobind
	onSaveSearchSelect(event) {
		let value = event && event.target ? event.target.value : event
		this.setState({selectedSearchId: value});
	}
}
