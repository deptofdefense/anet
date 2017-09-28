import React, {Component} from 'react'
import API from 'api'
import dict from 'dictionary'
import autobind from 'autobind-decorator'

import BarChart from 'components/BarChart'
import Fieldset from 'components/Fieldset'
import ReportCollection from 'components/ReportCollection'


/*
 * Component displaying reports submitted for approval up to the given date but
 * which have not been approved yet. They are displayed in different
 * presentation forms: chart, summary, table and map.
 */
export default class NotApprovedReports extends Component {
  static propTypes = {
    date: React.PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      date: props.date,
      graphData: [],
      reports: {list: []},
      reportsPageNum: 0,
    }
  }

  render() {
    let chartPart = ''
    if (this.state.graphData.length) {
      chartPart = <BarChart data={this.state.graphData} xProp='advisorOrg.id' yProp='notApproved' xLabel='advisorOrg.shortName' />
    }
    return (
      <div>
        {chartPart}
        <Fieldset title={`Not approved reports`}>
          <ReportCollection paginatedReports={this.state.reports} goToPage={this.goToReportsPage} />
        </Fieldset>
      </div>
    )
  }

  fetchData() {
    const commonQueryParams = {
      state: ['PENDING_APPROVAL'],
      updatedAtEnd: this.state.date.valueOf(),
    }
    const chartQueryParams = {}
    Object.assign(chartQueryParams, commonQueryParams)
    Object.assign(chartQueryParams, {
      pageSize: 0,  // retrieve all the filtered reports
    })
    const reportsQueryParams = {}
    Object.assign(reportsQueryParams, commonQueryParams)
    Object.assign(reportsQueryParams, {pageNum: this.state.reportsPageNum})

    // query used bt the chart
    let chartQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$chartQueryParams) {
          totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {chartQueryParams}, '($chartQueryParams: ReportSearchQuery)')
    // query used by the reports collection
    let reportsQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$reportsQueryParams) {
          pageNum, pageSize, totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {reportsQueryParams}, '($reportsQueryParams: ReportSearchQuery)')

    let pinned_ORGs = dict.lookup('pinned_ORGs')

    Promise.all([chartQuery, reportsQuery]).then(values => {
      this.setState({
        graphData: values[0].reportList.list
          .filter((item, index, d) => d.findIndex(t => {return t.advisorOrg.id === item.advisorOrg.id }) === index)
          .map(d => {d.notApproved = values[0].reportList.list.filter(item => item.advisorOrg.id === d.advisorOrg.id).length; return d})
          .sort((a, b) => {
            let a_index = pinned_ORGs.indexOf(a.advisorOrg.shortName)
            let b_index = pinned_ORGs.indexOf(b.advisorOrg.shortName)
            if (a_index < 0)
              return (b_index < 0) ?  a.advisorOrg.shortName.localeCompare(b.advisorOrg.shortName) : 1
            else
              return (b_index < 0) ? -1 : a_index-b_index
          }),
        reports: values[1].reportList
      })
    })
  }

  @autobind
  goToReportsPage(newPage) {
    this.setState({reportsPageNum: newPage}, () => this.fetchData())
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps !== this.props) {
      this.setState({date: nextProps.date})
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.date.valueOf() !== this.state.date.valueOf()) {
      this.fetchData()
    }
  }
}
