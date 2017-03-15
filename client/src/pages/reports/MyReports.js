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
                    list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
				draft: authoredReports(pageNum:0, pageSize:10, state: [DRAFT]) { 
                    list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
				released: authoredReports(pageNum:0, pageSize:10, state: [RELEASED]) { 
                    list {
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
                    reportByStatus => reportByStatus.list.map(report => new Report(report))
                ) 
            })
        )
    }

    render() {
        return <div>
            <Breadcrumbs items={[['My Reports', window.location.pathname]]} />
            <ReportSection title="Draft Reports" reports={_get(this.state, ['reports', 'draft'])} />
            <ReportSection title="Pending Approval" reports={_get(this.state, ['reports', 'pending'])} />
            <ReportSection title="Published Reports" reports={_get(this.state, ['reports', 'released'])} />
        </div>
    }
}

function ReportSection(props) {
    return <Fieldset title={props.title}>
        {props.reports ? <ReportCollection reports={props.reports} /> : <p>Loading...</p>}
    </Fieldset>

}