import React, {Component} from 'react'
import PropTypes from 'prop-types'
import API from 'api'
import autobind from 'autobind-decorator'
import {Button} from 'react-bootstrap'

import BarChart from 'components/BarChart'
import Fieldset from 'components/Fieldset'
import ReportCollection from 'components/ReportCollection'

import LoaderHOC from '../HOC/LoaderHOC'

const d3 = require('d3')
const chartByDayOfWeekId = 'reports_by_day_of_week'

const BarChartWithLoader = LoaderHOC('isLoading')('data')(BarChart)

/*
 * Component displaying a chart with number of reports released within a certain
 * period. The counting is done grouped by day of the week. 
 */
export default class ReportsByDayOfWeek extends Component {
  static propTypes = {
    startDate: PropTypes.object.isRequired,
    endDate: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      graphDataByDayOfWeek: [],
      focusedDayOfWeek: '',
      updateChart: true,  // whether the chart needs to be updated
      isLoading: false
    }
  }

  get queryParams() {
    return {
      state: ['RELEASED'],
      releasedAtStart: this.props.startDate.valueOf(),
      releasedAtEnd: this.props.endDate.valueOf(),
      includeEngagementDayOfWeek: 1,
    }
  }

  get startDateLongStr() { return this.props.startDate.format('DD MMM YYYY') }

  get endDateLongStr() { return this.props.endDate.format('DD MMM YYYY') }

  render() {
    const focusDetails = this.getFocusDetails()
    return (
      <div>
        <p className="help-text">{`Number of published reports between ${this.startDateLongStr} and ${this.endDateLongStr}, grouped by day of the week`}</p>
        <p className="chart-description">
          {`Displays the number of published reports which have been released
            between ${this.startDateLongStr} and ${this.endDateLongStr}.
            The reports are grouped by day of the week. In order to see the list
            of published reports for a day of the week, click on the bar
            corresponding to the day of the week.`}
        </p>
        <BarChartWithLoader
          chartId={chartByDayOfWeekId}
          data={this.state.graphDataByDayOfWeek}
          xProp='dayOfWeekInt'
          yProp='reportsCount'
          xLabel='dayOfWeekString'
          onBarClick={this.goToDayOfWeek}
          updateChart={this.state.updateChart}
          isLoading={this.state.isLoading}
        />
        <Fieldset
          title={`Reports by day of the week ${focusDetails.titleSuffix}`}
          id='cancelled-reports-details'
          action={!focusDetails.resetFnc
            ? '' : <Button onClick={() => this[focusDetails.resetFnc]()}>{focusDetails.resetButtonLabel}</Button>
          } >
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
    this.setState( {isLoading: true} )
    // Query used by the chart
    const chartQuery = this.runChartQuery(this.chartQueryParams())
    Promise.all([chartQuery]).then(values => {
      // The server returns values from 1 to 7
      let daysOfWeekInt = [1, 2, 3, 4, 5, 6, 7]
      // The day of the week (returned by the server) with value 1 is Sunday
      let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      // Set the order in which to display the days of the week
      let displayOrderDaysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      let simplifiedValues = values[0].reportList.list.map(d => {return {reportId: d.id, dayOfWeek: d.engagementDayOfWeek}})
      this.setState({
        isLoading: false,
        updateChart: true,  // update chart after fetching the data
        graphDataByDayOfWeek: displayOrderDaysOfWeek
          .map((d, i) => {
            let r = {}
            r.dayOfWeekInt = daysOfWeekInt[daysOfWeek.indexOf(d)]
            r.dayOfWeekString = d
            r.reportsCount = simplifiedValues.filter(item => item.dayOfWeek === r.dayOfWeekInt).length
            return r})
      })
    })
    this.fetchDayOfWeekData()
  }

  fetchDayOfWeekData() {
    // Query used by the reports collection
    const reportsQuery = this.runReportsQuery(this.reportsQueryParams())
    Promise.all([reportsQuery]).then(values => {
      this.setState({
        updateChart: false,  // only update the report list
        reports: values[0].reportList
      })
    })
  }

  chartQueryParams = () => {
    const chartQueryParams = {}
    Object.assign(chartQueryParams, this.queryParams)
    Object.assign(chartQueryParams, {
      pageSize: 0,  // retrieve all the filtered reports
    })
    return chartQueryParams
  }

  runChartQuery = (chartQueryParams) => {
    return API.query(/* GraphQL */`
      reportList(f:search, query:$chartQueryParams) {
        totalCount, list {
          ${ReportCollection.GQL_REPORT_FIELDS}
        }
      }`, {chartQueryParams}, '($chartQueryParams: ReportSearchQuery)')
  }

  reportsQueryParams = () => {
    const reportsQueryParams = {}
    Object.assign(reportsQueryParams, this.queryParams)
    Object.assign(reportsQueryParams, {
      pageNum: this.state.reportsPageNum,
      pageSize: 10
    })
    if (this.state.focusedDayOfWeek) {
      Object.assign(reportsQueryParams, {engagementDayOfWeek: this.state.focusedDayOfWeek.dayOfWeekInt})
    }
    return reportsQueryParams
  }

  runReportsQuery = (reportsQueryParams) => {
    return API.query(/* GraphQL */`
      reportList(f:search, query:$reportsQueryParams) {
        pageNum, pageSize, totalCount, list {
          ${ReportCollection.GQL_REPORT_FIELDS}
        }
      }`, {reportsQueryParams}, '($reportsQueryParams: ReportSearchQuery)')
  }

  @autobind
  goToReportsPage(newPage) {
    this.setState({updateChart: false, reportsPageNum: newPage}, () => this.fetchDayOfWeekData())
  }

  resetChartSelection(chartId) {
    d3.selectAll('#' + chartId + ' rect').attr('class', '')
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
      d3.select('#' + chartByDayOfWeekId + ' #bar_' + item.dayOfWeekInt).attr('class', 'selected-bar')
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentWillReceiveProps(nextProps) {
    if (this.datePropsChanged(nextProps)) {
      this.setState({
        reportsPageNum: 0,
        focusedDayOfWeek: ''
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.datePropsChanged(prevProps)) {
      this.fetchData()
    }
  }

  datePropsChanged = (otherProps) => {
    const startDateChanged = otherProps.startDate.valueOf() !== this.props.startDate.valueOf()
    const endDateChanged = otherProps.endDate.valueOf() !== this.props.endDate.valueOf()
    return startDateChanged || endDateChanged
  }
}
