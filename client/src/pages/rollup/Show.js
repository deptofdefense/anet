import React from 'react'
import Page from 'components/Page'
import {DropdownButton, MenuItem} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import Form from 'components/Form'
import LinkTo from 'components/LinkTo'
import autobind from 'autobind-decorator'
import History from 'components/History'
import moment from 'moment'

import API from 'api'
import {Poam} from 'models'
import {scaleLinear} from "d3-scale"

export default class RollupShow extends Page {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}
	static propTypes = {
		date : React.PropTypes.object
	}
	static stateTypes = {
		reports : React.PropTypes.object
	}
	static defaultProps = {
		date : moment()
	}
	constructor(props) {
		super(props)
		this.state = {
			date : {},
			reports : {}
		}
		let m = moment
		// debugger
	}
	get dateStr(){ return this.props.date.format('YYYY-MM-DD') }
	get dateLongStr() { return this.props.date.format('MMMM DD, YYYY') }
	get rollupStart() { return this.props.date.startOf('day') }
	get rollupEnd() { return this.props.date.endOf('day') }

	fetchData(props) {
		API.query(/* GraphQL */`
			reports(query:
			{engagementDateStart:${this.rollupStart.subtract(230,'days').format('x')}}) {
				id,engagementDate,atmosphere,intent
				,location {
				  id,lat,lng
				}
			}
			}	
		`).then(data => {
				console.log(data)
				data && this.setState({
					reports: data
				})
			})
	}

	render() {
		let {reports} = this.state
		// Admins can edit poams, or super users if this poam is assigned to their org.
		let currentUser = this.context.app.state.currentUser
		let canEdit = (currentUser && currentUser.isAdmin())
			// || (currentUser && poam.responsibleOrg && currentUser.isSuperUserForOrg(poam.responsibleOrg));

		// let dateStrS = moment().format('YYYY-MM-DD')

		return (
			<div>
				<Breadcrumbs items={[['Rollup',''],[this.dateStr,'rollup/' +this.dateStr]]} />

				{canEdit &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							<MenuItem eventKey="edit" >Edit</MenuItem>
						</DropdownButton>
					</div>
				}

				<Form static formFor={reports} horizontal>
					<fieldset>
						<legend>Daily Rollup - {this.dateLongStr}</legend>
						<div className="todo" contentEditable suppressContentEditableWarning>Some introductory text regarding {reports && reports.reports && reports.reports.length} reports, using 230 days due to SQLite issues.</div>
					</fieldset>
					<fieldset>
						<legend>Summary of Report Input</legend>
						<svg>
						</svg>
						<div className="todo" contentEditable suppressContentEditableWarning>Pretty graphs here</div>
					</fieldset>
					<fieldset>
						<legend>Report of the Day</legend>
						<div className="todo" contentEditable suppressContentEditableWarning>Pretty graphs here</div>
					</fieldset>
					<fieldset>
						<legend>Reports - {this.dateLongStr}</legend>
						<div className="todo" contentEditable suppressContentEditableWarning>Pretty graphs here</div>
					</fieldset>
				</Form>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		if (eventKey === "edit") {
			History.push(`/report/${this.state.report.id}/edit`);
		} else {
			console.log("Unimplemented Action: " + eventKey);
		}
	}
}
