import React, {Component, PropTypes} from 'react'
import {Button, Pagination} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import ReportSummary from 'components/ReportSummary'
import ReportTable from 'components/ReportTable'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import Leaflet from 'components/Leaflet'

const FORMAT_SUMMARY = 'summary'
const FORMAT_TABLE = 'table'
const FORMAT_MAP = 'map'

export default class ReportCollection extends Component {
	static propTypes = {
		reports: PropTypes.array.isRequired,
		pageSize: PropTypes.number,
		pageNum: PropTypes.number,
	}

	constructor(props) {
		super(props)

		this.state = {
			viewFormat: 'summary'
		}
	}


	render() {
		let {reports, pageSize, pageNum} = this.props
		pageSize = 1
		pageNum = 1

		if (!reports.length) {
			return <div>No Reports Found</div>
		}

		const numPages = Math.ceil(reports.length / pageSize)

		return <div className="report-collection">
			<header>
				<ButtonToggleGroup value={this.state.viewFormat} onChange={this.changeViewFormat}>
					<Button value={FORMAT_SUMMARY}>Summary</Button>
					<Button value={FORMAT_TABLE}>Table</Button>
					<Button value={FORMAT_MAP}>Map</Button>
				</ButtonToggleGroup>

				{numPages > 1 &&
					<Pagination
						className="pull-right"
						prev={pageNum > 1}
						next={pageNum < numPages}
						items={numPages}
						ellipsis={numPages > 10}
						maxButtons={10}
						activePage={pageNum}
						onSelect={this.goToPage}
					/>
				}
			</header>

			{this.state.viewFormat === FORMAT_TABLE && this.renderTable()}
			{this.state.viewFormat === FORMAT_SUMMARY && this.renderSummary()}
			{this.state.viewFormat === FORMAT_MAP && this.renderMap()}
		</div>
	}

	renderTable() {
		return <ReportTable showAuthors={true} reports={this.props.reports} />
	}

	renderSummary() {
		return <div>
			{this.props.reports.map(report =>
				<ReportSummary report={report} key={report.id} />
			)}
		</div>
	}

	renderMap() {
		let markers = []
		this.props.reports.forEach(report => {
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

	goToPage(pageNum) {

	}
}
