import React from 'react'
import Page from 'components/Page'
import {Grid, Row, Col} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import API from 'api'

export default class Home extends Page {
	constructor(props) {
		super(props)
		this.state = {
			pendingMe: null,
			myOrgToday: null,
			myReportsToday: null
		}
	}

	fetchData() {
		API.query(/*GraphQL */`
			pendingMe: reports(f:pendingMyApproval) { id },
			myOrg: reports(f:myOrgToday) { id },
			myReports: reports(f:myReportsToday) {  id }
		`).then(data => {
			this.setState({
				pendingMe: data.pendingMe,
				myOrgToday: data.myOrg,
				myReportsToday: data.myReports
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
				</fieldset>
			</div>
		)
	}
}
