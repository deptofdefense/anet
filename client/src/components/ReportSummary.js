import React, {Component, PropTypes} from 'react'
import {Button, Grid, Row, Col} from 'react-bootstrap'
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

		return <Grid fluid className="report-summary">
			<Row>
				<Col md={6}>
					{report.advisorOrg &&
						<LinkTo organization={new Organization(report.advisorOrg)} />
					}
					{report.principalOrg && '-> '}
					{report.principalOrg &&
						<LinkTo organization={new Organization(report.principalOrg)} />
					}
				</Col>
				<Col md={6}>
					{report.engagementDate && moment(report.engagementDate).format('D MMM YYYY')}
					{report.location &&
						<span> @&nbsp;
							<LinkTo location={report.location} />
						</span>
					}
				</Col>
			</Row>
			<Row>
				<Col md={6}>{report.primaryAdvisor && this.renderPerson(report.primaryAdvisor)}</Col>
				<Col md={6}>{report.primaryPrincipal && this.renderPerson(report.primaryPrincipal)}</Col>
			</Row>
			{report.cancelledReason &&
				<Row>
					<Col md={12}>
						Cancelled for: <b>{utils.sentenceCase(report.cancelledReason)}</b>
					</Col>
				</Row>
			}
			<Row>
				<Col md={8}>
					<h5>{report.intent}</h5>
					{report.keyOutcomes && <p><strong>Key outcomes:</strong> {report.keyOutcomes}</p>}
					{report.nextSteps && <p><strong>Next steps:</strong> {report.nextSteps}</p>}
				</Col>
			</Row>
			<LinkTo report={report} className="read-full"><Button>Read Full Report</Button></LinkTo>
		</Grid>
	}

	renderPerson(person) {
		person = new Person(person);
		return <div>
			<img height={20} width={20} src={person.iconUrl()} alt={person.role} className="person-icon" />
			<LinkTo person={person} />
			{person.position && person.position.organization &&
				<span> -&nbsp;
				<LinkTo organization={new Organization(person.position.organization)} />
				</span>
			}
			</div>
	}
}
