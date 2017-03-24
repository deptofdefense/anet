import React, {PropTypes} from 'react'
import Page from 'components/Page'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import GQL from 'graphql'
import Report from 'models/Report'
import Fieldset from 'components/Fieldset'
import autobind from 'autobind-decorator'

export default class MyReports extends Page {
	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	constructor() {
		super()
		this.state = {
			draft: null,
			pending: null,
			released: null
		}
		this.pageNums = {
			draft: 0,
			pending: 0,
			released: 0
		}
		this.partFuncs = {
			draft: this.getDraftPart,
			pending: this.getPendingApprovalPart,
			released: this.getReleasedPart
		}
	}

	componentWillReceiveProps(nextProps, nextContext) {
		if (!this.state.reports) {
			this.loadData(nextProps, nextContext)
		}
	}

	@autobind
	getPendingApprovalPart(authorId) {
		let query = {
			pageSize: 10,
			pageNum: this.pageNums.pending,
			authorId: authorId,
			state: ["PENDING_APPROVAL"]
		}
		return new GQL.Part(/* GraphQL */`
			pending: reportList(query: $pendingQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}`).addVariable("pendingQuery", "ReportSearchQuery", query)
	}

	@autobind
	getDraftPart(authorId) {
		let query = {
			pageSize: 10,
			pageNum: this.pageNums.draft,
			authorId: authorId,
			state: ['DRAFT']
		}
		return new GQL.Part(/* GraphQL */ `
			draft: reportList(query: $draftQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}`).addVariable("draftQuery", "ReportSearchQuery", query)
	}

	@autobind
	getReleasedPart(authorId) {
		let query = {
			pageSize: 10,
			pageNum: this.pageNums.released,
			authorId: authorId,
			state: ["RELEASED", "CANCELLED"]
		}
		return new GQL.Part(/* GraphQL */ `
			released: reportList(query: $releasedQuery) {
				pageNum, pageSize, totalCount, list {
					${ReportCollection.GQL_REPORT_FIELDS}
				}
			}`).addVariable("releasedQuery", "ReportSearchQuery", query)
	}


	fetchData(props, context) {
		if (!context.currentUser || !context.currentUser.id) {
			return
		}
		let authorId = context.currentUser.id
		let pending = this.getPendingApprovalPart(authorId)
		let draft = this.getDraftPart(authorId)
		let released = this.getReleasedPart(authorId)

		GQL.run([pending, draft, released]).then(data =>
			this.setState({
				pending: data.pending,
				draft: data.draft,
				released: data.released
			})
		)
	}

	render() {
		return <div>
			<Breadcrumbs items={[['My Reports', window.location.pathname]]} />

			{this.renderSection('Draft Reports', this.state.draft, this.goToPage.bind(this, 'draft'), 'draft-reports')}
			{this.renderSection("Pending Approval", this.state.pending, this.goToPage.bind(this, 'pending'), 'pending-approval')}
			{this.renderSection("Published Reports", this.state.released, this.goToPage.bind(this, 'released'), 'published-reports')}
		</div>
	}

	renderSection(title, reports, goToPage, id) {
		let content = <p>Loading...</p>
		if (reports && reports.list) {
			content = <ReportCollection paginatedReports={reports} goToPage={goToPage} />
		}

		return <Fieldset title={title} id={id}>
			{content}
		</Fieldset>
	}

	@autobind
	goToPage(section, pageNum) {
		this.pageNums[section] = pageNum
		let part = (this.partFuncs[section])(this.context.currentUser.id)
		GQL.run([part]).then( data => {
			let stateChange = {}
			stateChange[section] = data[section]
			console.log(stateChange)
			this.setState(stateChange)
		})
	}
}
