import React, {Component} from 'react'
import API from 'api'
import dict from 'dictionary'
import autobind from 'autobind-decorator'
import {Button} from 'react-bootstrap'

import BarChart from 'components/BarChart'
import Fieldset from 'components/Fieldset'
import ReportCollection from 'components/ReportCollection'


const d3 = require('d3')
const colors = {
  barColor: '#F5CA8D',
  selectedBarColor: '#EC971F'
}
const chartId = 'not_approved_reports_chart'


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
      focusedOrg: '',
      updateChart: true  // whether the chart needs to be updated
    }
  }

  render() {
    let chartPart = ''
    if (this.state.graphData.length) {
      chartPart = <BarChart
        chartId={chartId}
        data={this.state.graphData}
        xProp='advisorOrg.id'
        yProp='notApproved'
        xLabel='advisorOrg.shortName'
        onBarClick={this.goToOrg}
        barColor={colors.barColor}
        updateChart={this.state.updateChart}
      />
    }
    return (
      <div>
        {chartPart}
        <Fieldset
            title={`Not approved reports ${this.state.focusedOrg ? `for ${this.state.focusedOrg.shortName}` : ''}`}
            id='not-approved-reports-details'
            action={!this.state.focusedOrg
              ? '' : <Button onClick={() => this.goToOrg()}>All organizations</Button>
            }
          >
          <ReportCollection paginatedReports={this.state.reports} goToPage={this.goToReportsPage} />
        </Fieldset>
      </div>
    )
  }

  fetchData() {
    let pinned_ORGs = dict.lookup('pinned_ORGs')
    const commonQueryParams = {
      state: ['PENDING_APPROVAL'],
      updatedAtEnd: this.state.date.valueOf(),
    }
    const chartQueryParams = {}
    Object.assign(chartQueryParams, commonQueryParams)
    Object.assign(chartQueryParams, {
      pageSize: 0,  // retrieve all the filtered reports
    })
    // Query used by the chart
    let chartQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$chartQueryParams) {
          totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {chartQueryParams}, '($chartQueryParams: ReportSearchQuery)')
    Promise.all([chartQuery]).then(values => {
      this.setState({
        updateChart: true,  // update chart after fetching the data
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
          })
      })
    })
    this.fetchOrgData()
  }

  fetchOrgData() {
    const commonQueryParams = {
      state: ['PENDING_APPROVAL'],
      updatedAtEnd: this.state.date.valueOf(),
    }
    const reportsQueryParams = {}
    Object.assign(reportsQueryParams, commonQueryParams)
    Object.assign(reportsQueryParams, {pageNum: this.state.reportsPageNum})
    if (this.state.focusedOrg) {
      Object.assign(reportsQueryParams, {advisorOrgId: this.state.focusedOrg.id})
    }
    // Query used by the reports collection
    let reportsQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$reportsQueryParams) {
          pageNum, pageSize, totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {reportsQueryParams}, '($reportsQueryParams: ReportSearchQuery)')
    Promise.all([reportsQuery]).then(values => {
      this.setState({
        updateChart: false,  // only update the report list
        reports: values[0].reportList
      })
    })
  }

  @autobind
  goToReportsPage(newPage) {
    this.setState({updateChart: false, reportsPageNum: newPage}, () => this.fetchOrgData())
  }

  resetChartSelection() {
    d3.selectAll('#' + chartId + ' rect').attr('fill', colors.barColor)
  }

  @autobind
  goToOrg(item) {
    // Note: we set updateChart to false as we do not want to rerender the chart
    // when changing the focus organisation.
    this.setState({updateChart: false, reportsPageNum: 0, focusedOrg: (item ? item.advisorOrg : '')}, () => this.fetchOrgData())
    // remove highlighting of the bars
    this.resetChartSelection()
    if (item) {
      // highlight the bar corresponding to the selected organisation
      d3.select('#' + chartId + ' #bar_' + item.advisorOrg.id).attr('fill', colors.selectedBarColor)
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.date.valueOf() !== this.props.date.valueOf()) {
      this.setState({date: nextProps.date, focusedOrg: ''})  // reset focus when changing the date
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
