import React, {Component} from 'react'
import autobind from 'autobind-decorator'

import ReportSummary from 'components/ReportSummary'
import ReportTable from 'components/ReportTable'
import RadioGroup from 'components/RadioGroup'
import Leaflet from 'components/Leaflet'

import {Radio, Table} from 'react-bootstrap'

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
		return <fieldset>
			<div style={{height:"50px"}} >
				<RadioGroup value={this.state.viewFormat} onChange={this.changeViewFormat} className="pull-right">
					<Radio value={FORMAT_SUMMARY}>Summary</Radio>
					<Radio value={FORMAT_TABLE}>Table</Radio>
					<Radio value={FORMAT_MAP}>Map</Radio>
				</RadioGroup>
			</div>
			{this.state.viewFormat === FORMAT_TABLE && this.renderTable() }
			{this.state.viewFormat === FORMAT_SUMMARY && this.renderSummary() }
			{this.state.viewFormat === FORMAT_MAP && this.renderMap() }
		</fieldset>
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
	changeViewFormat(event) {
		let value = event && event.target && event.target.value;
		this.setState({viewFormat: value})
	}

}


