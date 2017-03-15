import React from 'react'
import Page from 'components/Page'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import API from 'api'
import _get from 'lodash.get'
import _mapValues from 'lodash.mapvalues'
import Report from 'models/Report'
import Fieldset from 'components/Fieldset'

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

    render() {
        return <div>
            <Breadcrumbs items={[['My Reports', window.location.pathname]]} />
            <ReportSection title="Draft Reports" reports={this.state.reports} reportGroup={'draft'} />
            <ReportSection title="Pending Approval" reports={this.state.reports} reportGroup={'pending'} />
            <ReportSection title="Published Reports" reports={this.state.reports} reportGroup={'released'} />
        </div>
    }
}

function ReportSection(props) {
    let content = <p>Loading...</p>
    const reportGroup = _get(props, ['reports', props.reportGroup])
    if (reportGroup) {
        content = <ReportCollection paginatedReports={reportGroup} />
    }

    return <Fieldset title={props.title}>
        {content}
    </Fieldset>
}