import React, {Component, PropTypes} from 'react'
import {Grid, Row, Col, Label} from 'react-bootstrap'
import utils from 'utils'

import LinkTo from 'components/LinkTo'
import ReportApprovals from 'components/ReportApprovals'
import Tag from 'components/Tag'
import {Report} from 'models'
import dict from 'dictionary'

import moment from 'moment'

export default class ReportSummary extends Component {
	static propTypes = {
		report: PropTypes.object.isRequired,
	}

	render() {
		let report = new Report(this.props.report)

		function PersonComponent({person}) {
			if (!person) {
				return <span style={{marginLeft: '5px'}}>Unspecified</span>
			}
			return <LinkTo person={person}>
				{person.rank} {person.name}
			</LinkTo>
		}

		return <Grid fluid className="report-summary">
			{report.state === 'DRAFT' &&
				<p className="report-draft">
					<strong>Draft{report.updatedAt && ':'}</strong>
					{
						/* If the parent does not fetch report.updatedAt, we will not display this
							so we do not get a broken view. It would be better to go through and
							find all the places where report is passed in and ensure that the graphql
							query includes updatedAt, but I don't have time for that now.
						*/
						report.updatedAt &&
							<span> last saved at {moment(report.updatedAt).format('D MMMM, YYYY @ HHmm')}</span>
					}
				</p>
			}

			{report.isRejected() &&
				<p className="report-rejected">
					<strong>Rejected</strong>
				</p>
			}

			{report.cancelledReason &&
				<p className="report-cancelled">
					<strong>Cancelled: </strong>
					{utils.sentenceCase(report.cancelledReason.substr(report.cancelledReason.indexOf('_')))}
				</p>
			}

			{report.isPending() &&
				<p className="report-pending">
					<strong>Pending Approval</strong>
				</p>
			}

			{report.isFuture() &&
				<p className="report-future">
					<strong>Upcoming Engagement</strong>
				</p>
			}

			{report.isPending() &&
				<Row>
					<Col md={12}><ReportApprovals report={report} /></Col>
				</Row>
			}
			<Row>
				<Col md={12}>
					{report.engagementDate &&
						<Label bsStyle="default" className="engagement-date">
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
				<Col md={12}>
					<PersonComponent person={report.primaryAdvisor} />
					{report.advisorOrg &&
						<span> (<LinkTo organization={report.advisorOrg} />)</span>
					}
					<span className="people-separator">&#x25B6;</span>
					<PersonComponent person={report.primaryPrincipal} />
					{report.principalOrg &&
						<span> (<LinkTo organization={report.principalOrg} />)</span>
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
					{report.poams.length > 0 && <span><strong>{dict.lookup('POAM_SHORT_NAME')}s:</strong> {report.poams.map((poam,i) =>
    {return poam.shortName + (i < report.poams.length - 1 ? ", " : "")})}</span> }
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
        <Col md={12}>
        {report.tags && <Row><Col md={12}>{report.tags.map((tag,i) => <Tag key={tag.id} tag={tag} />)}</Col></Row>}
        </Col>
      </Row>
			<Row className="hide-for-print">
				<Col mdOffset={9} md={3}>
					<LinkTo report={report} button className="pull-right read-report-button">Read report</LinkTo>
				</Col>
			</Row>
		</Grid>
	}
}
