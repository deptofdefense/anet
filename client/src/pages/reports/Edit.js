import React, {PropTypes} from 'react'
import Page from 'components/Page'
import moment from 'moment'

import ReportForm from './Form'
import {ContentForHeader} from 'components/Header'
import Breadcrumbs from 'components/Breadcrumbs'
import NotFound from 'components/NotFound'

import API from 'api'
import {Report} from 'models'
import _get from 'lodash.get'

export default class ReportEdit extends Page {
	static pageProps = {
		useNavigation: false
	}

	static contextTypes = {
		app: PropTypes.object,
	}

	constructor(props) {
		super(props)

		this.state = {
			report: new Report(),
		}
	}

	fetchData(props) {
		API.query(/* GraphQL */`
			report(id:${props.params.id}) {
				id, intent, engagementDate, atmosphere, atmosphereDetails
				keyOutcomes, reportText, nextSteps, cancelledReason,
				location { id, name},
				attendees {
					id, name, role, primary
					position { id, name }
				}
				poams { id, shortName, longName, responsibleOrg { id, shortName} }
			}
		`).then(data => {
			ReportEdit.pageProps.fluidContainer = !Boolean(data.report)
			let newState = {
				report: data.report ? new Report(data.report) : null,
			}
			if (_get(newState, ['report', 'engagementDate'])) {
				newState.report.engagementDate = moment(newState.report.engagementDate).format()
			}

			this.setState(newState)
		}, err => {
			if (err.errors[0] === 'Invalid Syntax') {
				ReportEdit.pageProps = {fluidContainer: true, useNavigation: false}
				console.log('error set state', err)
				this.setState({report: null})
			}
		})
	}

	render() {
		let report = this.state.report

		if (!report) {
			return <NotFound text={`Report with ID ${this.props.params.id} not found.`} />
		}

		return (
			<div>
				<ContentForHeader>
					<h2>Edit Report #{report.id}</h2>
				</ContentForHeader>

				<Breadcrumbs items={[['Report #' + report.id, '/reports/' + report.id], ['Edit', '/reports/' + report.id + '/edit']]} />

				<ReportForm edit report={report} />
			</div>
		)
	}
}
