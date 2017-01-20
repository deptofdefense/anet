import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Button, Grid, Row, Col, FormControl, FormGroup, ControlLabel, Alert} from 'react-bootstrap'
import SavedSearchTable from 'components/SavedSearchTable'
import {Link} from 'react-router'

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
			savedSearches: [],
			selectedSearchId: null
		}
	}

	fetchData() {
		API.query(/*GraphQL */`
			pendingMe: reports(f:pendingMyApproval) { id },
			myOrg: reports(f:myOrgToday) { id },
			myReports: reports(f:myReportsToday) {id },
			savedSearches: savedSearchs(f:mine) {id, name}
		`).then(data => {
			let selectedSearchId = data.savedSearches && data.savedSearches.length > 0 ? data.savedSearches[0].id : null;
			this.setState({
				pendingMe: data.pendingMe,
				myOrgToday: data.myOrg,
				myReportsToday: data.myReports,
				savedSearches: data.savedSearches,
				selectedSearchId: selectedSearchId
			});
		})
	}

	render() {
		let {pendingMe, myOrgToday, myReportsToday} = this.state
		let currentUser = this.context.app.state.currentUser;
		let org = currentUser && currentUser.position && currentUser.position.organization
		let firstTime = true;

		return (
			<div>
				<Breadcrumbs />

				{firstTime &&
					<Alert bsStyle="info" >
						<h4>Welcome to ANET!</h4>
						<p>We noticed this is your first time here, Can we <b><a onClick={this.pageIntroduction}>Show you Around</a></b>?</p>
					</Alert>
				}

				<fieldset className="homeTileRow">
					<legend>My ANET Snapshot</legend>
					<Grid fluid>
						<Row>
							<Col md={4} className="homeTile">
								<Link to={"/search?type=reports&pendingApprovalOf=" + currentUser.id}>
									<h1>{pendingMe && pendingMe.length}</h1>
									Pending Approval
								</Link>
							</Col>
							<Col md={4} className="homeTile" >
								{org &&
									<Link to={"/search?type=reports&authorOrgId=" + org.id}>
										<h1>{myOrgToday && myOrgToday.length}</h1>
										{org.shortName}s recent reports
									</Link>
								}
							</Col>
							<Col md={4} className="homeTile" >
								<Link to={"/search?type=reports&authorId=" + currentUser.id}>
									<h1>{myReportsToday && myReportsToday.length}</h1>
									My reports in last 24 hrs
								</Link>
							</Col>
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
	pageIntroduction() {
		let intro = introJs();
		intro.setOptions({
			steps: [
				{
					element: document.querySelector(".intro-snapshot"),
					intro: "This is your ANET Snapshot. It includes links to reports that are immediately relevant to you."
				},
				{
					element: document.querySelector(".intro-search"),
					intro: "Use the search bar to look for Reports, People, Positions, Organizations, PoAMs, or Organizations. You can type in anything you want here"
				},
				{
					element: document.querySelector(".intro-createReport"),
					intro: "This button allows easy access to quickly create a new Report"
				}
			]
		});
		intro.start();
	}

	@autobind
	onSaveSearchSelect(event) {
		let value = event && event.target ? event.target.value : event
		this.setState({selectedSearchId: value});
	}
}
