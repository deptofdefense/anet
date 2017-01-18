import React, {Component, PropTypes} from 'react'
import {Row, Col} from 'react-bootstrap'
import LinkTo from 'components/LinkTo'

export default class ReportCard extends Component {
	static propTypes = {
		report: PropTypes.object.isRequired,
	}

	render() {
		let {report} = this.props

		return <div className="clearfix">
			<Row>
				<Col md={6}>
					<LinkTo organization={report.primaryAdvisor.position.organization} />
					&nbsp;&gt;&nbsp;
					<LinkTo organization={report.primaryPrincipal.position.organization} />
				</Col>

				<Col md={6}>
					{report.engagementDate} @ <LinkTo location={report.location} />
				</Col>
			</Row>

			<Row>
				<Col md={6}>
					<LinkTo person={report.primaryAdvisor}>
						{report.primaryAdvisor.rank.toUpperCase()}&nbsp;
						{report.primaryAdvisor.name}
					</LinkTo> - <LinkTo organization={report.primaryAdvisor.position.organization} />
				</Col>

				<Col md={6}>
					<LinkTo person={report.primaryPrincipal}>
						{report.primaryPrincipal.rank.toUpperCase()}&nbsp;
						{report.primaryPrincipal.name}
					</LinkTo> - <LinkTo organization={report.primaryPrincipal.position.organization} />
				</Col>
			</Row>

			<p><LinkTo poam={report.poams[0]} /></p>

			<p><strong>{report.intent}</strong></p>
			<p>{report.keyOutcomes}</p>

			<div className="pull-right">
				<LinkTo report={report}>Read full report | {report.comments.length} comments</LinkTo>
			</div>
		</div>
	}
}
