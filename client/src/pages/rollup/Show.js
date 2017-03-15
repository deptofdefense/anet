import React from 'react'
import Page from 'components/Page'
import {Modal, Alert, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import moment from 'moment'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import CalendarButton from 'components/CalendarButton'
import Form from 'components/Form'
import History from 'components/History'

import API from 'api'
import {Report} from 'models'

var d3 = null/* required later */

const graphCss = {
	width: '100%',
	height: '300px'
}

const barColors = {
	cancelled: '#e39394',
	verified: '#9CBDA4',
	unverified: '#F5D98C',
	incoming: '#DA9795',
}

const calendarButtonCss = {
	marginLeft: '20px',
	marginTop: '-8px',
}

export default class RollupShow extends Page {
	static propTypes = {
		date: React.PropTypes.object,
	}

	get dateStr() { return this.state.date.format('DD MMM YYYY') }
	get dateLongStr() { return this.state.date.format('DD MMMM YYYY') }
	get rollupStart() { return moment(this.state.date).subtract(1, 'days').startOf('day').hour(19) } //7pm yesterday
	get rollupEnd() { return moment(this.state.date).endOf('day').hour(18) } // 6:59:59pm today.

	constructor(props) {
		super(props)

		this.state = {
			date: moment(+props.date || +props.location.query.date),
			reports: {list: []},
			graphData: {},
			showEmailModal: false,
			email: {},
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
		const rollupQuery = {
			state: ['RELEASED'], //Specifically excluding cancelled engagements.
			releasedAtStart: this.rollupStart.valueOf(),
			releasedAtEnd: this.rollupEnd.valueOf(),
			engagementDateStart: moment(this.rollupStart).subtract(14, 'days').valueOf(),
			sortBy: "ENGAGEMENT_DATE",
			sortOrder: "DESC"
		}
		API.query(/* GraphQL */`
			reportList(f:search, query:$rollupQuery) {
				pageNum, pageSize, totalCount, list {
					id, state, intent, engagementDate, intent, keyOutcomes, nextSteps, cancelledReason, atmosphere, atmosphereDetails
					author { id, name }
					location { id, name, lat, lng }
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
					principalOrg {
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

		// Set up the data
		const step1 = d3.nest()
			.key((entry) => (entry.org && entry.org.shortName) || "Unknown")
			.rollup(entry => entry[0])
			.entries(graphData)

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
		y.domain([0,d3.max(step1.map(d => d.value.released + d.value.cancelled))])
		d3.line()
			.x(function(d,i) { return x(d.key) })
			.y(function(d,i) { return y(d.value.released) })

		var xAxis = d3.axisBottom()
			.scale(x)
		var maxValue = d3.max(y.domain())
		var yAxis = d3.axisLeft()
			.scale(y).ticks(Math.min(maxValue+1,10))

		g.append('g')
			.attr('transform', 'translate(0,' + height + ')')
			.attr('fill', '#00f')
			.call(xAxis)

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

		function createBarPart(color, getYVal, getHeight) {
			g.selectAll('.bar')
				.data(step1)
				.enter()
				.append('rect')
				.attr('class', 'line')
				.attr('width', width / step1.length - padding)
				.attr('x', d => x(d.key) + (width / (step1.length + padding)))
				.attr('height', d => height - y(getHeight(d.value) || 0))
				.attr('y', d => y(getYVal(d.value) || 0))
				.attr('fill', () => color)
		}

		createBarPart(barColors.verified, val => val.released, val => val.released)
		createBarPart(barColors.cancelled, val => val.released + val.cancelled, val => val.cancelled)
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[['Rollup', ''],[this.dateStr, 'rollup/' +this.dateStr]]} />

				<Fieldset title={
					<span>
						Daily Rollup - {this.dateLongStr}
						<CalendarButton onChange={this.changeRollupDate} value={this.state.date.toISOString()} style={calendarButtonCss} />
					</span>
				} action={
					<div>
						<Button href={`/api/reports/rollup?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`}>Print</Button>
						<Button onClick={this.toggleEmailModal} bsStyle="primary">Email rollup</Button>
					</div>
				}>
					<svg ref={el => this.graph = el} style={graphCss} />
				</Fieldset>

				<Fieldset title="Reports">
					<ReportCollection paginatedReports={this.state.reports} />
				</Fieldset>

				{this.renderEmailModal()}
			</div>
		)
	}

	@autobind
	changeRollupDate(newDate) {
		let date = moment(newDate)
		History.replace({pathname: 'rollup', query: {date: date.valueOf()}})

		this.setState({date: date}, () => {
			this.loadData()
		})
	}

	@autobind
	renderEmailModal() {
		let email = this.state.email
		return <Modal show={this.state.showEmailModal} onHide={this.toggleEmailModal}>
			<Form formFor={email} onChange={this.onChange} submitText={false} >
				<Modal.Header closeButton>
					<Modal.Title>Email rollup</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{email.errors &&
						<Alert bsStyle="danger">{email.errors}</Alert>
					}

					<Form.Field id="to" />
					<Form.Field componentClass="textarea" id="comment" />
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="primary" onClick={this.emailRollup}>Send email</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	}

	@autobind
	toggleEmailModal() {
		this.setState({showEmailModal: !this.state.showEmailModal})
	}

	@autobind
	emailRollup() {
		let email = this.state.email
		if (!email.to) {
			email.errors = 'You must select a person to send this to'
			this.setState({email})
			return
		}

		email = {
			toAddresses: email.to.replace(/\s/g, '').split(/[,;]/),
		}
		API.send(`/api/reports/rollup/email?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}&comment=${email.comment}`, email).then (() =>
			this.setState({
				success: 'Email successfully sent',
				showEmailModal: false,
				email: {}
			})
		)
	}
}
