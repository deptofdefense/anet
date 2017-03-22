import React, {PropTypes} from 'react'
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
import Messages from 'components/Messages'

import API from 'api'

var d3 = null/* required later */

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

	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	get dateStr() { return this.state.date.format('DD MMM YYYY') }
	get dateLongStr() { return this.state.date.format('DD MMMM YYYY') }
	get rollupStart() { return moment(this.state.date).subtract(1, 'days').startOf('day').hour(19) } //7pm yesterday
	get rollupEnd() { return moment(this.state.date).endOf('day').hour(18) } // 6:59:59pm today.

	constructor(props) {
		super(props)

		this.state = {
			date: moment(+props.date || +props.location.query.date || undefined),
			reports: {list: []},
			reportsPageNum: 0,
			graphData: [],
			showEmailModal: false,
			email: {},
			maxReportAge: null,
		}
	}

	componentWillReceiveProps(newProps) {
		let newDate = moment(+newProps.location.query.date || undefined)
		if (!this.state.date.isSame(newDate)) {
			this.setState({date: newDate}, () => this.loadData())
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

	fetchData(props, context) {
		let settings = context.app.state.settings
		let maxReportAge = settings.DAILY_ROLLUP_MAX_REPORT_AGE_DAYS
		if (!maxReportAge) {
			//don't run the query unless we've loaded the rollup settings.
			return
		}
		this.setState({maxReportAge})

		const rollupQuery = {
			state: ['RELEASED'], //Specifically excluding cancelled engagements.
			releasedAtStart: this.rollupStart.valueOf(),
			releasedAtEnd: this.rollupEnd.valueOf(),
			engagementDateStart: moment(this.rollupStart).subtract(maxReportAge, 'days').valueOf(),
			sortBy: "ENGAGEMENT_DATE",
			sortOrder: "DESC",
			pageNum: this.state.reportsPageNum,
		}

		let graphQuery = API.fetch(`/api/reports/rollupGraph?startDate=${rollupQuery.releasedAtStart}&endDate=${rollupQuery.releasedAtEnd}&engagementDateStart=${rollupQuery.engagementDateStart}`)

		let reportQuery = API.query(/* GraphQL */`
			reportList(f:search, query:$rollupQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}
		`, {rollupQuery}, '($rollupQuery: ReportSearchQuery)')

		Promise.all([reportQuery, graphQuery]).then(values => {
			this.setState({
				reports: values[0].reportList,
				graphData: values[1].sort((a, b) => a.org.shortName - b.org.shortName)
			})
		})
	}

	componentDidUpdate() {
		this.renderGraph()
	}

	render() {
		return (
			<div>
				<Breadcrumbs items={[[`Rollup for ${this.dateStr}`, 'rollup/']]} />
				<Messages error={this.state.error} success={this.state.success} />

				<Fieldset title={
					<span>
						Daily Rollup - {this.dateLongStr}
						<CalendarButton onChange={this.changeRollupDate} value={this.state.date.toISOString()} style={calendarButtonCss} />
					</span>
				} action={
					<div>
						<Button href={this.emailPreviewUrl()} target="rollup">Print</Button>
						<Button onClick={this.toggleEmailModal} bsStyle="primary">Email rollup</Button>
					</div>
				}>
					<p className="help-text">Number of reports released today per organization</p>
					<svg ref={el => this.graph = el} style={{width: '100%'}} />
				</Fieldset>

				<Fieldset title="Reports">
					<ReportCollection paginatedReports={this.state.reports} goToPage={this.goToReportsPage} />
				</Fieldset>

				{this.renderEmailModal()}
			</div>
		)
	}

	renderGraph() {
		let graphData = this.state.graphData
		if (!graphData || !d3) {
			return
		}

		const BAR_HEIGHT = 24
		const BAR_PADDING = 8
		const MARGIN = {top: 0, right: 10, bottom: 20, left: 150}
		let width = this.graph.clientWidth - MARGIN.left - MARGIN.right
		let height = (BAR_HEIGHT + BAR_PADDING) * graphData.length - BAR_PADDING

		let maxNumberOfReports = Math.max.apply(Math, graphData.map(d => d.released + d.cancelled))

		let xScale = d3.scaleLinear()
						.domain([0, maxNumberOfReports])
						.range([0, width])

		let yScale = d3.scaleBand()
						.domain(graphData.map(d => d.org.shortName))
						.range([0, height])

		let graph = d3.select(this.graph)
		graph.selectAll('*').remove()

		graph = graph.attr('width', width + MARGIN.left + MARGIN.right)
					 .attr('height', height + MARGIN.top + MARGIN.bottom)
					 .append('g')
						.attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)

		let xAxis = d3.axisBottom(xScale).ticks(maxNumberOfReports, 'd')
		let yAxis = d3.axisLeft(yScale)

		graph.append('g').call(yAxis)
		graph.append('g')
				.attr('transform', `translate(0, ${height})`)
				.call(xAxis)

		let bar = graph.selectAll('.bar')
			.data(graphData)
			.enter().append('g')
				.attr('transform', (d, i) => `translate(2, ${i * (BAR_HEIGHT + BAR_PADDING) - 1})`)
				.classed('bar', true)

		bar.append('rect')
				.attr('width', d => xScale(d.released) - 2)
				.attr('height', BAR_HEIGHT)
				.attr('fill', barColors.verified)

		bar.append('text')
				.attr('x', d => xScale(d.released) - 6)
				.attr('y', BAR_HEIGHT / 2)
				.attr('dy', '.35em')
				.style('text-anchor', 'end')
				.text(d => d.released || '')

		bar.append('rect')
				.attr('x', d => xScale(d.released) - 2)
				.attr('width', d => xScale(d.cancelled))
				.attr('height', BAR_HEIGHT)
				.attr('fill', barColors.cancelled)

		bar.append('text')
				.attr('x', d => xScale(d.released) + xScale(d.cancelled) - 6)
				.attr('y', BAR_HEIGHT / 2)
				.attr('dy', '.35em')
				.style('text-anchor', 'end')
				.text(d => d.cancelled || '')
	}

	@autobind
	goToReportsPage(newPageNum) {
		this.state.reportsPageNum = newPageNum
		this.loadData()
	}

	@autobind
	changeRollupDate(newDate) {
		let date = moment(newDate)
		History.replace({pathname: 'rollup', query: {date: date.valueOf()}})
	}

	@autobind
	renderEmailModal() {
		let email = this.state.email
		return <Modal show={this.state.showEmailModal} onHide={this.toggleEmailModal}>
			<Form formFor={email} onChange={this.onChange} submitText={false} >
				<Modal.Header closeButton>
					<Modal.Title>Email rollup - {this.dateStr}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{email.errors &&
						<Alert bsStyle="danger">{email.errors}</Alert>
					}

					<Form.Field id="to" />
					<Form.Field componentClass="textarea" id="comment" />
				</Modal.Body>

				<Modal.Footer>
					<a href={this.emailPreviewUrl()} target="rollup" className="btn">Preview</a>
					<Button bsStyle="primary" onClick={this.emailRollup}>Send email</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	}

	@autobind
	toggleEmailModal() {
		this.setState({showEmailModal: !this.state.showEmailModal})
	}

	emailPreviewUrl() {
		return `/api/reports/rollup?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`
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
			comment: email.comment
		}

		API.send(`/api/reports/rollup/email?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`, email).then (() =>
			this.setState({
				success: 'Email successfully sent',
				showEmailModal: false,
				email: {}
			})
		)
	}
}
