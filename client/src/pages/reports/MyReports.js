import React from 'react'
import Page from 'components/Page'
import Breadcrumbs from 'components/Breadcrumbs'
import ReportCollection from 'components/ReportCollection'
import API from 'api'
import _get from 'lodash.get'
import Report from 'models/Report'

export default class MyReports extends Page {
    constructor() {
        super()
        this.state = {}
    }

    fetchData() {
        API.query(/* GraphQL */`
			person(f:me) {
				authoredReports(pageNum:0, pageSize:10) { 
                    list {
                        id, intent, engagementDate, keyOutcomes, nextSteps
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                }
			}
		`).then(data => this.setState({reports: data.person.authoredReports.list.map(report => new Report(report))}))
    }

    render() {
        return <div>
            <Breadcrumbs items={[['My Reports', window.location.pathname]]} />
            <ReportSection title="Draft Reports" reports={this.state.reports} />
        </div>
    }
}

function ReportSection(props) {
    return <div>
        <h2>{props.title}</h2>
        <ReportCollection reports={props.reports} />
    </div>

}