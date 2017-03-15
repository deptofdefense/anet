import React from 'react'
import Page from 'components/Page'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import API from 'api'
import _get from 'lodash.get'
import _mapValues from 'lodash.mapvalues'
import Report from 'models/Report'
import Fieldset from 'components/Fieldset'
import autobind from 'autobind-decorator'

export default class MyReports extends Page {
    constructor() {
        super()
        this.state = {}
    }

    fetchData() {
        API.query(/* GraphQL */`
			person(f:me) {
				pending: authoredReports(pageNum:0, pageSize:10, state: [PENDING_APPROVAL]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
				draft: authoredReports(pageNum:0, pageSize:10, state: [DRAFT]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
				released: authoredReports(pageNum:0, pageSize:10, state: [RELEASED]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
			}
		`).then(data => 
            this.setState({
                reports: _mapValues(
                    data.person, 
                    reportByStatus => ({list: Report.fromArray(reportByStatus.list), ...reportByStatus})
                ) 
            })
        )
    }

    @autobind
    queryReportPage(reportGroupName, $state, $pageNum) {
        API.query(/* GraphQL */`
			person(f:me) {
				authoredReports(pageNum: $pageNum, pageSize: 10, state: [$state]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                }
			}
		`, {$state, $pageNum}).then(data => 
            this.setState({
                reports: {
                    [reportGroupName]: ({
                        list: Report.fromArray(data.person.authoredReports.list), 
                        ...data.person.authoredReports
                    }),
                    ...this.state.reports
                }
            })
        )
    }

    render() {
        const ReportSection = props => {
            let content = <p>Loading...</p>
            const reportGroup = _get(props, ['reports', props.reportGroupName]),
                goToPage = pageNum => this.queryReportPage(props.reportGroupName, props.reportGroupState, pageNum)

            if (reportGroup) {
                content = <ReportCollection paginatedReports={reportGroup} goToPage={goToPage} />
            }

            return <Fieldset title={props.title}>
                {content}
            </Fieldset>
        }

        return <div>
            <Breadcrumbs items={[['My Reports', window.location.pathname]]} />
            <ReportSection title="Draft Reports" reports={this.state.reports} reportGroupName='draft' reportGroupState='DRAFT' />
            <ReportSection title="Pending Approval" reports={this.state.reports} reportGroupName='pending' reportGroupState='PENDING' />
            <ReportSection title="Published Reports" reports={this.state.reports} reportGroupName='released' reportGroupState='RELEASED' />
        </div>
    }
}
