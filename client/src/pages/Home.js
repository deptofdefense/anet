import React from 'react'
import Page from 'components/Page'
import {Grid, Row, Col, FormControl, FormGroup, ControlLabel} from 'react-bootstrap'
import SavedSearchTable from 'components/SavedSearchTable'

import Breadcrumbs from 'components/Breadcrumbs'
import API from 'api'
import autobind from 'autobind-decorator'

export default class Home extends Page {
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
			let selectedSearchId = data.savedSearches.length > 0 ? data.savedSearches[0].id : null;
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

		return (
			<div>
				<Breadcrumbs />

				<fieldset>
					<legend>My ANET Snapshot</legend>
					<Grid fluid>
						<Row>
							<Col md={4} style={{textAlign: 'center'}} >
								<h1>{pendingMe && pendingMe.length}</h1>
								Pending Approval
							</Col>
							<Col md={4} style={{textAlign: 'center'}} >
								<h1>{myOrgToday && myOrgToday.length}</h1>
								In my Organization in last 24hrs
							</Col>
							<Col md={4} style={{textAlign: 'center'}} >
								<h1>{myReportsToday && myReportsToday.length}</h1>
								My reports in last 24 hrs
							</Col>
						</Row>
					</Grid>
				</fieldset>

				<fieldset>
					<legend>Subscribed Searches</legend>
					<FormGroup controlId="savedSearchSelect">
						<ControlLabel>Select a Saved Search</ControlLabel>
						<FormControl componentClass="select" onChange={this.onSaveSearchSelect}>
							{this.state.savedSearches.map( savedSearch =>
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
