import React, {Component} from 'react'
import autobind from 'autobind-decorator'

import ReportSummary from 'components/ReportSummary'
import ReportTable from 'components/ReportTable'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import Leaflet from 'components/Leaflet'

import {Table, Button} from 'react-bootstrap'

const FORMAT_SUMMARY = 'summary'
const FORMAT_TABLE = 'table'
const FORMAT_MAP = 'map'

export default class ReportCollection extends Component {
	static propTypes = {
		reports: React.PropTypes.array.isRequired
	}

	constructor(props) {
		super(props)

		this.state = {
			viewFormat: 'summary'
		}
	}


	render() {
		if (this.props.reports.length === 0) {
			return <div>No Reports Found</div>
		}
		return <div>
			<div style={{height:"50px"}} >
				<ButtonToggleGroup value={this.state.viewFormat} onChange={this.changeViewFormat} className="pull-right">
					<Button value={FORMAT_SUMMARY}>Summary</Button>
					<Button value={FORMAT_TABLE}>Table</Button>
					<Button value={FORMAT_MAP}>Map</Button>
				</ButtonToggleGroup>
			</div>
			{this.state.viewFormat === FORMAT_TABLE && this.renderTable() }
			{this.state.viewFormat === FORMAT_SUMMARY && this.renderSummary() }
			{this.state.viewFormat === FORMAT_MAP && this.renderMap() }
		</div>
	}

	renderTable() {
		return <ReportTable showAuthors={true} reports={this.props.reports} />
	}

	renderSummary() {
		return <Table responsive>
			<tbody>
				{this.props.reports.map(report =>
					<tr key={report.id}>
						<td><ReportSummary report={report} /></td>
					</tr>
				)}
			</tbody>
		</Table>
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

}


