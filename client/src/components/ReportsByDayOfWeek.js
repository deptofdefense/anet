import React, {Component} from 'react'
import API from 'api'
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
const chartByDayOfWeekId = 'reports_by_day_of_week'


/*
 * Component displaying a chart with number of reports released within a certain
 * period. The counting is done grouped by day of the week. 
 */
export default class ReportsByDayOfWeek extends Component {
  static propTypes = {
    date: React.PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      date: props.date,
      graphDataByDayOfWeek: [],
      focusedDayOfWeek: '',
      updateChart: true  // whether the chart needs to be updated
    }
  }

  get queryParams() {
    return {
      state: ['RELEASED'],
      releasedAtStart: this.state.date.valueOf(),
      includeEngagementDayOfWeek: 1,
    }
  }

  render() {
    let chartByDayOfWeek = ''
    if (this.state.graphDataByDayOfWeek.length) {
      chartByDayOfWeek = <BarChart
        chartId={chartByDayOfWeekId}
        data={this.state.graphDataByDayOfWeek}
        xProp='dayOfWeekInt'
        yProp='reportsCount'
        xLabel='dayOfWeekString'
        onBarClick={this.goToDayOfWeek}
        barColor={colors.barColor}
        updateChart={this.state.updateChart}
      />
    }
    let focusDetails = this.getFocusDetails()
    return (
      <div>
        {chartByDayOfWeek}
        <Fieldset
            title={`Reports by day of the week ${focusDetails.titleSuffix}`}
            id='cancelled-reports-details'
            action={!focusDetails.resetFnc
              ? '' : <Button onClick={() => this[focusDetails.resetFnc]()}>{focusDetails.resetButtonLabel}</Button>
            }
          >
          <ReportCollection paginatedReports={this.state.reports} goToPage={this.goToReportsPage} />
        </Fieldset>
      </div>
    )
  }

  getFocusDetails() {
    let titleSuffix = ''
    let resetFnc = ''
    let resetButtonLabel = ''
    if (this.state.focusedDayOfWeek) {
      titleSuffix = `for ${this.state.focusedDayOfWeek.dayOfWeekString}`
      resetFnc = 'goToDayOfWeek'
      resetButtonLabel = 'All days of the week'
    }
    return {
      titleSuffix: titleSuffix,
      resetFnc: resetFnc,
      resetButtonLabel: resetButtonLabel
    }
  }

  fetchData() {
    const chartQueryParams = {}
    Object.assign(chartQueryParams, this.queryParams)
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
      // The server returns values from 1 to 7
      let daysOfWeekInt = [1, 2, 3, 4, 5, 6, 7]
      // The day of the week (returned by the server) with value 1 is Sunday
      let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      // Set the order in which to display the days of the week
      let displayOrderDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      let simplifiedValues = values[0].reportList.list.map(d => {return {reportId: d.id, dayOfWeek: d.engagementDayOfWeek}})
      this.setState({
        updateChart: true,  // update chart after fetching the data
        graphDataByDayOfWeek: displayOrderDaysOfWeek
          .map((d, i) => {
            let r = {}
            r.dayOfWeekInt = daysOfWeekInt[daysOfWeek.indexOf(d)]
            r.dayOfWeekString = d
            r.reportsCount = simplifiedValues.filter(item => item.dayOfWeek === r.dayOfWeekInt).length
            return r}),
      })
    })
    this.fetchDayOfWeekData()
  }

  fetchDayOfWeekData() {
    const reportsQueryParams = {}
    Object.assign(reportsQueryParams, this.queryParams)
    Object.assign(reportsQueryParams, {pageNum: this.state.reportsPageNum})
    if (this.state.focusedDayOfWeek) {
      Object.assign(reportsQueryParams, {engagementDayOfWeek: this.state.focusedDayOfWeek.dayOfWeekInt})
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
    this.setState({updateChart: false, reportsPageNum: newPage}, () => this.fetchDayOfWeekData())
  }

  resetChartSelection(chartId) {
    d3.selectAll('#' + chartId + ' rect').attr('fill', colors.barColor)
  }

  @autobind
  goToDayOfWeek(item) {
    // Note: we set updateChart to false as we do not want to re-render the chart
    // when changing the focus day of the week.
    this.setState({updateChart: false, reportsPageNum: 0, focusedDayOfWeek: item}, () => this.fetchDayOfWeekData())
    // remove highlighting of the bars
    this.resetChartSelection(chartByDayOfWeekId)
    if (item) {
      // highlight the bar corresponding to the selected day of the week
      d3.select('#' + chartByDayOfWeekId + ' #bar_' + item.dayOfWeekInt).attr('fill', colors.selectedBarColor)
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.date.valueOf() !== this.props.date.valueOf()) {
      this.setState({date: nextProps.date, focusedDayOfWeek: ''})  // reset focus when changing the date
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
