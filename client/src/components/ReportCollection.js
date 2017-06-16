import React, {Component, PropTypes} from 'react'
import {Button, Pagination} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import ReportSummary from 'components/ReportSummary'
import ReportTable from 'components/ReportTable'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import Leaflet from 'components/Leaflet'
import _get from 'lodash.get'

import DOWNLOAD_ICON from 'resources/download.png'

const FORMAT_SUMMARY = 'summary'
const FORMAT_TABLE = 'table'
const FORMAT_MAP = 'map'

const GQL_REPORT_FIELDS =  /* GraphQL */`
	id, intent, engagementDate, keyOutcomes, nextSteps, cancelledReason
	atmosphere, atmosphereDetails, state
	author { id, name }
	primaryAdvisor { id, name, role, position { organization { id, shortName}}},
	primaryPrincipal { id, name, role, position { organization { id, shortName}}},
	advisorOrg { id, shortName},
	principalOrg { id, shortName},
	location { id, name, lat, lng},
	poams {id, shortName, longName}
`


export default class ReportCollection extends Component {
	static propTypes = {
		reports: PropTypes.array,
		paginatedReports: PropTypes.shape({
			totalCount: PropTypes.number,
			pageNum: PropTypes.number,
			pageSize: PropTypes.number,
			list: PropTypes.array.isRequired,
		}),
		goToPage: PropTypes.func,
		downloadAll: PropTypes.func
	}

	constructor(props) {
		super(props)

		this.state = {
			viewFormat: 'summary'
		}
	}

	render() {
		var reports

		if (this.props.paginatedReports) {
			var {pageSize, pageNum, totalCount} = this.props.paginatedReports
			var numPages = Math.ceil(totalCount / pageSize)
			reports = this.props.paginatedReports.list
			pageNum++
		} else {
			reports = this.props.reports
		}

		let reportsExist = _get(reports, 'length', 0) > 0

		return <div className="report-collection">
			{reportsExist ?
				<div>
					<header>
						<ButtonToggleGroup value={this.state.viewFormat} onChange={this.changeViewFormat} className="hide-for-print">
							<Button value={FORMAT_SUMMARY}>Summary</Button>
							<Button value={FORMAT_TABLE}>Table</Button>
							<Button value={FORMAT_MAP}>Map</Button>
						</ButtonToggleGroup>

						{numPages > 1 &&
							<Pagination
								className="pull-right"
								prev
								next
								items={numPages}
								ellipsis
								maxButtons={6}
								activePage={pageNum}
								onSelect={(value) => {this.props.goToPage(value - 1)}}
							/>
						}

						{
							this.props.downloadAll &&
							<div className="pull-right">
								<Button  onClick={this.props.downloadAll}><img src={DOWNLOAD_ICON} height={16} alt="Export" /></Button>
							</div>
						}

					</header>

					<div>
						{this.state.viewFormat === FORMAT_TABLE && this.renderTable(reports)}
						{this.state.viewFormat === FORMAT_SUMMARY && this.renderSummary(reports)}
						{this.state.viewFormat === FORMAT_MAP && this.renderMap(reports)}
					</div>
				</div>
				:
				<em>No reports found</em>
			}
		</div>
	}

	renderTable(reports) {
		return <ReportTable showAuthors={true} reports={reports} />
	}

	renderSummary(reports) {
		return <div>
			{reports.map(report =>
				<ReportSummary report={report} key={report.id} />
			)}
		</div>
	}

	renderMap(reports) {
		let markers = []
		reports.forEach(report => {
			if (report.location && report.location.lat) {
				markers.push({id: report.id, lat: report.location.lat, lng: report.location.lng , name: report.intent })
			}
		})
		return <Leaflet markers={markers} />
	}

	@autobind
	changeViewFormat(value) {
		this.setState({viewFormat: value})
	}
}

ReportCollection.GQL_REPORT_FIELDS = GQL_REPORT_FIELDS
