import React, {PropTypes} from 'react'
import Page from 'components/Page'
import {Modal, Alert, Button, Popover, Overlay} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import moment from 'moment'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import CalendarButton from 'components/CalendarButton'
import ButtonToggleGroup from 'components/ButtonToggleGroup'
import Form from 'components/Form'
import History from 'components/History'
import Messages from 'components/Messages'
import dict from 'dictionary'

import API from 'api'

var d3 = null/* required later */

const barColors = {
	cancelled: '#EC971F',
	verified: '#337AB7',
}

const calendarButtonCss = {
	marginLeft: '20px',
	marginTop: '-8px',
}

const legendCss = {
	width: '14px',
	height: '14px',
	display: 'inline-block',
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
			hoveredBar: {org: {}},
			orgType: "ADVISOR_ORG",
		}
	}

	componentWillReceiveProps(newProps, newContext) {
		let newDate = moment(+newProps.location.query.date || undefined)
		if (!this.state.date.isSame(newDate)) {
			this.setState({date: newDate}, () => this.loadData(newProps, newContext))
		} else {
			super.componentWillReceiveProps(newProps, newContext)
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

		const rollupQuery = {
			state: ['RELEASED'], //Specifically excluding cancelled engagements.
			releasedAtStart: this.rollupStart.valueOf(),
			releasedAtEnd: this.rollupEnd.valueOf(),
			engagementDateStart: moment(this.rollupStart).subtract(maxReportAge, 'days').valueOf(),
			sortBy: "ENGAGEMENT_DATE",
			sortOrder: "DESC",
			pageNum: this.state.reportsPageNum,
			pageSize: 10,
		}

		let graphQueryUrl = `/api/reports/rollupGraph?startDate=${rollupQuery.releasedAtStart}&endDate=${rollupQuery.releasedAtEnd}`
		if (this.state.focusedOrg) {
			if (this.state.orgType === 'PRINCIPAL_ORG') {
				rollupQuery.principalOrgId = this.state.focusedOrg.id
				rollupQuery.includePrincipalOrgChildren = true
				graphQueryUrl += `&principalOrganizationId=${this.state.focusedOrg.id}`
			} else {
				rollupQuery.advisorOrgId = this.state.focusedOrg.id
				rollupQuery.includeAdvisorOrgChildren = true
				graphQueryUrl += `&advisorOrganizationId=${this.state.focusedOrg.id}`
			}
		} else if (this.state.orgType) {
			graphQueryUrl += `&orgType=${this.state.orgType}`
		}

		let graphQuery = API.fetch(graphQueryUrl)

		let reportQuery = API.query(/* GraphQL */`
			reportList(f:search, query:$rollupQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}
		`, {rollupQuery}, '($rollupQuery: ReportSearchQuery)')

		let pinned_ORGs = dict.lookup('pinned_ORGs')

		Promise.all([reportQuery, graphQuery]).then(values => {
			this.setState({
				reports: values[0].reportList,
				graphData: values[1]
					.map(d => {d.org = d.org || {id: -1, shortName: "Other"}; return d})
					.sort((a, b) => {
						let a_index = pinned_ORGs.indexOf(a.org.shortName)
						let b_index = pinned_ORGs.indexOf(b.org.shortName)
						if (a_index<0)
							return (b_index<0) ?  a.org.shortName.localeCompare(b.org.shortName) : 1
						else
							return (b_index<0) ? -1 : a_index-b_index
					})
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

					<Overlay
						show={!!this.state.graphPopover}
						placement="top"
						container={document.body}
						animation={false}
						target={() => this.state.graphPopover}
					>
						<Popover id="graph-popover" title={this.state.hoveredBar.org.shortName}>
							<p>Released: {this.state.hoveredBar.released}</p>
							<p>Cancelled: {this.state.hoveredBar.cancelled}</p>
							<p>Click to view details</p>
						</Popover>
					</Overlay>

					<div className="graph-legend">
						<div style={{...legendCss, background: barColors.verified}}></div> Released reports:&nbsp;
						<strong>{this.state.graphData.reduce((acc, org) => acc + org.released, 0)}</strong>
					</div>
					<div className="graph-legend">
						<div style={{...legendCss, background: barColors.cancelled}}></div> Cancelled engagements:&nbsp;
						<strong>{this.state.graphData.reduce((acc, org) => acc + org.cancelled, 0)}</strong>
					</div>
				</Fieldset>

				<Fieldset
					title={`Reports ${this.state.focusedOrg ? `for ${this.state.focusedOrg.shortName}` : ''}`}
					action={!this.state.focusedOrg
						? <ButtonToggleGroup value={this.state.orgType} onChange={this.changeOrgType}>
							<Button value="ADVISOR_ORG">Advisor organizations</Button>
							<Button value="PRINCIPAL_ORG">Principal organizations</Button>
						</ButtonToggleGroup>
						: <Button onClick={() => this.goToOrg()}>All organizations</Button>
					}
				>
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

		if (graphData === this.renderedGraph) {
			return
		}

		this.renderedGraph = graphData

		const BAR_HEIGHT = 24
		const BAR_PADDING = 8
		const MARGIN = {top: 0, right: 10, bottom: 20, left: 150}
		let box = this.graph.getBoundingClientRect()
		let boxWidth = box.right - box.left
		let width = boxWidth - MARGIN.left - MARGIN.right
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

		let xAxis = d3.axisBottom(xScale).ticks(Math.min(maxNumberOfReports, 10), 'd')
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
				.on('click', d => this.goToOrg(d.org))
				.on('mouseenter', d => this.setState({graphPopover: d3.event.target, hoveredBar: d}))
				.on('mouseleave', d =>this.setState({graphPopover: null}))

		bar.append('rect')
				.attr('width', d => d.released && xScale(d.released) - 2)
				.attr('height', BAR_HEIGHT)
				.attr('fill', barColors.verified)

		bar.append('text')
				.attr('x', d => xScale(d.released) - 6)
				.attr('y', BAR_HEIGHT / 2)
				.attr('dy', '.35em')
				.style('text-anchor', 'end')
				.text(d => d.released || '')

		bar.append('rect')
				.attr('x', d => d.released && xScale(d.released) - 2)
				.attr('width', d => d.cancelled && (xScale(d.cancelled) - (d.released ? 0 : 2)))
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
	goToOrg(org) {
		this.setState({reportsPageNum: 0, focusedOrg: org, graphPopover: null}, () => this.loadData())
	}

	@autobind
	changeOrgType(orgType) {
		this.setState({orgType}, () => this.loadData())
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
					<h5>
						{this.state.focusedOrg ?
							`Reports for ${this.state.focusedOrg.shortName}` :
							`All reports by ${this.state.orgType.replace('_', ' ').toLowerCase()}`
						}
					</h5>

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

	//**NOTE**: This hits an endpoint that sits only on the backend dropwizard server
	// In development mode when running the frontend out of Node, this link will not work
	// but if you change the URL to the port of the backend server (ie 8080) rather than
	// the port of the frontend server (ie 3000) then it should work.  NPM doesn't proxy this
	// through for some reason. But it works in production when the frontend and backend
	// are run out of the same server process.
	emailPreviewUrl() {
		// orgType drives chart
		// principalOrganizationId or advisorOrganizationId drive drill down.
		let rollupUrl = `/api/reports/rollup?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`
		if (this.state.focusedOrg) {
			if (this.state.orgType === 'PRINCIPAL_ORG') {
				rollupUrl += `&principalOrganizationId=${this.state.focusedOrg.id}`
			} else {
				rollupUrl += `&advisorOrganizationId=${this.state.focusedOrg.id}`
			}
		}
		if (this.state.orgType) {
			rollupUrl += `&orgType=${this.state.orgType}`
		}

		return rollupUrl
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

		let emailUrl = `/api/reports/rollup/email?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`
		if (this.state.focusedOrg) {
			if (this.state.orgType === 'PRINCIPAL_ORG') {
				emailUrl += `&principalOrganizationId=${this.state.focusedOrg.id}`
			} else {
				emailUrl += `&advisorOrganizationId=${this.state.focusedOrg.id}`
			}
		}
		if (this.state.orgType) {
			emailUrl += `&orgType=${this.state.orgType}`
		}


		API.send(emailUrl, email).then (() =>
			this.setState({
				success: 'Email successfully sent',
				showEmailModal: false,
				email: {}
			})
		)
	}
}
