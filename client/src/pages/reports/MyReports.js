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

    componentWillReceiveProps(nextProps) {
		if (!this.state.reports) {
			this.loadData(nextProps)
		}
	}

    fetchData() {
        API.query(/* GraphQL */`
			person(f:me) {
				pending: authoredReports(pageNum:0, pageSize:10, state: [PENDING_APPROVAL]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere, state, updatedAt
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
				draft: authoredReports(pageNum:0, pageSize:10, state: [DRAFT]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere, state, updatedAt
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                },
				released: authoredReports(pageNum:0, pageSize:10, state: [RELEASED]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere, state, updatedAt
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
    queryReportPage(reportGroupName, state, pageNum) {
        // TODO it would be better not to use string interpolation here for the graphql query,
        // but I kept getting an error when I tried to pull $state out into a variable.
        // I was passing state as a string with variable definition ($state: ReportState), 
        // and I got the following error:
        //
        //      {"errors":["Validation error of type VariableTypeMismatch: Variable type doesn't match"]}
        API.query(/* GraphQL */`
			person(f:me) {
				authoredReports(pageNum: $pageNum, pageSize: 10, state: [${state}]) { 
                    pageNum, pageSize, totalCount, list {
                        id, intent, engagementDate, keyOutcomes, nextSteps, atmosphere, state, updatedAt
                        primaryAdvisor { id, name } ,
                        primaryPrincipal {id, name },
                        advisorOrg { id, shortName, longName }
                        principalOrg { id, shortName, longName }
                        location { id, name, lat, lng }
                    }
                }
			}
		`, {pageNum}, '($pageNum: Int)').then(data => 
            this.setState({
                reports: {
                    ...this.state.reports,
                    [reportGroupName]: ({
                        list: Report.fromArray(data.person.authoredReports.list), 
                        ...data.person.authoredReports
                    })
                }
            })
        )
    }

    render() {
        const ReportSection = props => {
            let content = <p>Loading...</p>
            const reportGroup = _get(this.state, ['reports', props.reportGroupName]),
                goToPage = pageNum => this.queryReportPage(props.reportGroupName, props.reportGroupState, pageNum)

            if (reportGroup) {
                content = <ReportCollection paginatedReports={reportGroup} goToPage={goToPage} />
            }

            return <Fieldset title={props.title} id={props.id}>
                {content}
            </Fieldset>
        }

        return <div>
            <Breadcrumbs items={[['My Reports', window.location.pathname]]} />
            <ReportSection title="Draft Reports" reportGroupName='draft' reportGroupState='DRAFT' id='draft-reports' />
            <ReportSection title="Pending Approval" reportGroupName='pending' reportGroupState='PENDING' id='pending-approval' />
            <ReportSection title="Published Reports" reportGroupName='released' reportGroupState='RELEASED' id='published-reports' />
        </div>
    }
}
