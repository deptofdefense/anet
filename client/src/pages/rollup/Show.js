import React from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'
import moment from 'moment'

import {DropdownButton, MenuItem, Button} from 'react-bootstrap'

import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import ReportSummary from 'components/ReportSummary'
import DatePicker from 'react-bootstrap-date-picker'

import API from 'api'
import {Report} from 'models'

var d3 = null/* required later */

const graphCss = {
	width: '100%',
	height: '300px'
}

const barColors = {
	verified: '#9CBDA4',
	unverified: '#F5D98C',
	incoming: '#DA9795',
}

export default class RollupShow extends Page {
	static propTypes = {
		date: React.PropTypes.object,
	}

	static defaultProps = {
		date: moment(),
	}

	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	get dateStr() { return this.state.date.format('DD MMM YYYY') }
	get dateLongStr() { return this.state.date.format('DD MMMM YYYY') }
	get rollupStart() { return moment(this.state.date).startOf('day') }
	get rollupEnd() { return moment(this.state.date).endOf('day') }

	constructor(props) {
		super(props)
		this.state = {
			date: props.date,
			reports: {list: []},
			graphData: {}
		}
	}

	componentDidMount() {
		super.componentDidMount()

		if (d3) {
			return
		}

		require.ensure([], () => {
			d3 = require('d3')
			this.forceUpdate()
		})
	}

	fetchData(props) {
		let rollupQuery = {
			releasedAtStart: this.rollupStart.valueOf(),
			releasedAtEnd: this.rollupEnd.valueOf(),
			engagementDateStart: moment(this.rollupStart).subtract(14, 'days').valueOf(),
			state: 'RELEASED',
		}
		API.query(/* GraphQL */`
			reportList(f:search, query:$rollupQuery) {
				pageNum, pageSize, totalCount, list {
					id, state, intent, engagementDate, intent, keyOutcomes, nextSteps
					author { id, name }
					location { id, name, lat, lng}
					poams { id, longName }
					comments { id }
					primaryAdvisor {
						id, name, rank
						position { organization { id, shortName, longName }}
					}
					primaryPrincipal {
						id, name, rank
						position { organization { id, shortName, longName }}
					}
					advisorOrg {
						id, shortName
						parentOrg { id, shortName }
					}
				}
			}
		`, {rollupQuery}, '($rollupQuery: ReportSearchQuery)')
		.then(data => {
			data.reportList.list = Report.fromArray(data.reportList.list)
			if (data.reportList.pageSize == null) {
				data.reportList.pageSize = 1
				data.reportList.pageNum = 1
				data.reportList.totalCount = data.reportList.list.length
			}
			this.setState({reports: data.reportList})
		})

		API.fetch(`/api/reports/rollupGraph?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`
		).then(data => {
			this.setState({graphData: data})
		})
	}

	componentDidUpdate() {
		let graphData = this.state.graphData
		if (!graphData || !d3) {
			return
		}

		// Sets up the data
		var step1// = d3.nest()
		//		.key(function(d){return (d.advisorOrg && d.advisorOrg.shortName)})
		//		.rollup(function(d){return {l:d.length,s:d[0].state,r:d}})
		//		.entries(reports)

		step1 = d3.nest()
			.key((orgId) => orgId)
			.rollup(orgId => graphData[orgId])
			.entries(Object.keys(graphData));

		var svg = d3.select(this.graph),
			margin = {top: 20, right: 20, bottom: 20, left: 20},
			width = this.graph.clientWidth - margin.left - margin.right,
			height = this.graph.clientHeight - margin.top - margin.bottom,
			padding = 22,
			g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

		var x = d3.scaleBand().rangeRound([0,width])

		var y = d3.scaleLinear()
			.rangeRound([height, 0])

		x.domain(step1.map(d => d.key))
		y.domain([0,d3.max(step1.map(d => d.value.RELEASED))])
		d3.line()
			.x(function(d,i) { return x(d.key) })
			.y(function(d,i) { return y(d.value.RELEASED) })

		var xAxis = d3.axisBottom()
			.scale(x)
		var maxValue = d3.max(step1.map(d => d.value.RELEASED))
		var yAxis = d3.axisLeft()
			.scale(y).ticks(Math.min(maxValue+1,10))

		g.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('fill', '#00f')

		g.append('g')
			.attr('fill', '#400')
			.call(yAxis)
			.append('text')
			.attr('fill', '#000')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '0.71em')
			.style('text-anchor', 'end')
			.text('# of Reports')

		g.selectAll('.bar')
			.data(step1)
			.enter().append('rect')
			.attr('class', 'line')
			.attr('width', width / step1.length - padding)
			.attr('x',function(d,i){return x(d.key) + (width / (step1.length + padding))})
			.attr('height', (d,i) => height - y((d.value.RELEASED || 0)))
			.attr('y', (d,i) => y((d.value.RELEASED || 0)) )
			.attr('fill', function(d){return barColors.verified})
	}

	render() {
		// let reports = this.state.reports.list
		let reportOTD = null //reports[0]

		// Admins can edit poams, or super users if this poam is assigned to their org.
		let currentUser = this.context.app.state.currentUser
		let canEdit = currentUser && currentUser.isAdmin()

		return (
			<div>
				<Breadcrumbs items={[['Rollup', ''],[this.dateStr, 'rollup/' +this.dateStr]]} />

				{canEdit &&
					<div className="pull-right">
						<DropdownButton bsStyle="primary" title="Actions" id="actions" className="pull-right" onSelect={this.actionSelect}>
							<MenuItem eventKey="email">Email rollup</MenuItem>
							<MenuItem eventKey="print">Print</MenuItem>
						</DropdownButton>
					</div>
				}

				<h1>Daily Rollup - {this.dateLongStr}</h1>

				<Button bsStyle="primary" >
					<DatePicker showTodayButton onChange={this.changeRollupDate} />
				</Button>

				<fieldset>
					<legend>Summary of Report Input</legend>
					<svg ref={el => this.graph = el} style={graphCss} />
				</fieldset>

				{reportOTD && <fieldset>
					<legend>Report of the Day</legend>

					<ReportSummary report={reportOTD} />
				</fieldset>}

				<fieldset>
					<legend>Reports - {this.dateLongStr}</legend>

					<ReportCollection paginatedReports={this.state.reports} />
				</fieldset>
			</div>
		)
	}

	@autobind
	actionSelect(eventKey, event) {
		console.log('Unimplemented Action: ' + eventKey)
	}

	@autobind
	changeRollupDate(event) {
		let dtg = moment(event)
		this.state.date = dtg
		this.loadData()
	}
}
