import React, {Component, PropTypes} from 'react'
import {Button, Grid, Row, Col, Label} from 'react-bootstrap'
import utils from 'utils'

import LinkTo from 'components/LinkTo'
import {Report, Person, Organization} from 'models'

import moment from 'moment'

export default class ReportSummary extends Component {
	static propTypes = {
		report: PropTypes.object.isRequired,
	}

	render() {
		let report = new Report(this.props.report)

		function PersonComponent({person}) {
			if (!person) {
				return null
			}
			return <LinkTo person={person}>
				{person.rank} {person.name}
			</LinkTo>
		}

		return <Grid fluid className="report-summary">
			{report.cancelledReason &&
				<p className="report-cancelled">
					<strong>Cancelled: </strong>
					{utils.sentenceCase(report.cancelledReason.substr(report.cancelledReason.indexOf('_')))}
				</p>
			}

			<Row>
				<Col md={6}>
					{report.engagementDate && 
						<Label bsStyle="primary" className="engagement-date">
							{moment(report.engagementDate).format('D MMM YYYY')}
						</Label>
					}
					{report.location &&
						<span>
							<LinkTo location={report.location} />
						</span>
					}
				</Col>
			</Row>
			<Row>
				<Col md={6}>
					<PersonComponent person={report.primaryAdvisor} />
					{report.advisorOrg &&
						<span>&nbsp;(<LinkTo organization={report.advisorOrg} />)</span>
					}
					&#x25B6;
					<PersonComponent person={report.primaryPrincipal} />
					{report.principalOrg &&
						<span>&nbsp;(<LinkTo organization={report.principalOrg} />)</span>
					}
				</Col>
			</Row>

			<Row>
				<Col md={12}>
					{report.atmosphere && <span><strong>Atmospherics:</strong> {utils.sentenceCase(report.atmosphere)} 
						{report.atmosphereDetails && ` – ${report.atmosphereDetails}`}</span> }
				</Col>
			</Row>
			<Row>
				<Col md={12}>
					{report.intent && <span><strong>Meeting goal:</strong> {report.intent}</span> }
				</Col>
			</Row>
			<Row>
				<Col md={12}>
					{report.keyOutcomes && <span><strong>Key outcomes:</strong> {report.keyOutcomes}</span> }
				</Col>
			</Row>
			<Row>
				<Col md={12}>
					{report.nextSteps && <span><strong>Next steps:</strong> {report.nextSteps}</span> }
				</Col>
			</Row>

			<Row>
				<Col mdOffset={9} md={3}>
					<LinkTo report={report} className="read-full">
						<Button bsStyle="primary">Read Full Report</Button>
					</LinkTo>
				</Col>
			</Row>
		</Grid>
	}
}
