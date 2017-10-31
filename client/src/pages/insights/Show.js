import React, {PropTypes} from 'react'
import Page from 'components/Page'
import NotApprovedReports from 'components/NotApprovedReports'
import CancelledReports from 'components/CancelledReports'
import ReportsByPoam from 'components/ReportsByPoam'
import ReportsByDayOfWeek from 'components/ReportsByDayOfWeek'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import Fieldset from 'components/Fieldset'
import CalendarButton from 'components/CalendarButton'
import autobind from 'autobind-decorator'
import moment from 'moment'

import FilterableAdvisorReportsTable from 'components/AdvisorReports/FilterableAdvisorReportsTable'
import DateRangeSearch from 'components/advancedSearch/DateRangeSearch'

const insightDetails = {
  'not-approved-reports': {
    component: NotApprovedReports,
    title: 'Not Approved Reports',
    help: 'Number of reports not approved since',
    dateRange: false
  },
  'cancelled-reports': {
    component: CancelledReports,
    title: 'Cancelled Reports',
    help: 'Number of reports cancelled since',
    dateRange: false
  },
  'reports-by-poam': {
    component: ReportsByPoam,
    title: 'Reports by PoAM',
    help: 'Number of reports by PoAM',
    dateRange: false
  },
  'reports-by-day-of-week': {
    component: ReportsByDayOfWeek,
    title: 'Reports by day of the week',
    help: 'Number of reports by day of the week',
    dateRange: true
  },
}

const calendarButtonCss = {
  marginLeft: '20px',
  marginTop: '-8px',
}

const dateRangeFilterCss = {
  marginTop: '20px'
}

export default class InsightsShow extends Page {
  static contextTypes = {
    app: PropTypes.object.isRequired,
  }

  get currentDateTime() {
    return moment()
  }

  get cutoffDate() {
    let settings = this.context.app.state.settings
    let maxReportAge = 1 + (parseInt(settings.DAILY_ROLLUP_MAX_REPORT_AGE_DAYS, 10) || 14)
    return moment().subtract(maxReportAge, 'days')
  }

  get referenceDateLongStr() { return this.state.referenceDate.format('DD MMMM YYYY') }

  constructor(props) {
    super(props)
    this.state = {
      insight: props.params.insight,
      referenceDate: null,
      startDate: null,
      endDate: null,
    }
  }

  getFilters = () => {
    const calenderFilter = <CalendarButton onChange={this.changeReferenceDate} value={this.state.referenceDate.toISOString()} style={calendarButtonCss} />
    const dateRangeFilter = <DateRangeSearch queryKey="engagementDate" value="" onChange={this.handleChangeDateRange} style={dateRangeFilterCss} />
    return (insightDetails[this.state.insight].dateRange) ? dateRangeFilter : calenderFilter
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.insight !== this.state.insight) {
      this.setState({insight: nextProps.params.insight, referenceDate: this.cutoffDate})
    }
  }

  componentDidMount() {
    super.componentDidMount()

    this.setState({
      referenceDate: this.cutoffDate,
      startDate: this.cutoffDate,
      endDate: this.currentDateTime
    })
  }

  handleChangeDateRange = (value) => {
    if (value.relative < 0) {
      this.updateRelativeDateTime(value)
    } else {
      this.updateDateRange(value)
    }
  }

  updateRelativeDateTime = (value) => {
    const startDate = moment(parseInt(value.relative, 10) + this.currentDateTime.valueOf())
    this.setState({
      startDate: startDate,
      endDate: this.currentDateTime
    })
  }

  updateDateRange = (value) => {
    if (value.start !== null) {
      this.updateStartDate(moment(value.start))
    }

    if (value.end !== null) {
      this.updateEndDate(moment(value.end))
    }
  }

  updateStartDate = (newDate) => {
    const { startDate } = this.state
    const startDateChanged = newDate.valueOf() !== startDate.valueOf()
    if (startDateChanged) {
      this.setState({ startDate: newDate })
    }
  }

  updateEndDate = (newDate) => {
    const { endDate } = this.state
    const endDateChanged = newDate.valueOf() !== endDate.valueOf()
    if (endDateChanged) {
      this.setState({ endDate: newDate })
    }
  }

  @autobind
  changeReferenceDate(newDate) {
    let date = moment(newDate)
    if (date.valueOf() !== this.state.referenceDate.valueOf()) {
      this.setState({referenceDate: date})
    }
  }

  render() {
    let InsightComponent = insightDetails[this.state.insight].component
    let insightTitle = insightDetails[this.state.insight].title
    let insightPath = '/insights/' + this.state.insight
    return (
      <div>
        <Breadcrumbs items={[['Insights ' + insightTitle, insightPath]]} />
        <Messages error={this.state.error} success={this.state.success} />

        {this.state.referenceDate &&
          <Fieldset id={this.state.insight} data-jumptarget title={
            <span>
              {insightTitle} - {this.referenceDateLongStr}
              {this.getFilters()}
            </span>
            }>
              <p className="help-text">{insightDetails[this.state.insight].help} {this.referenceDateLongStr}</p>
              <InsightComponent
                date={this.state.referenceDate.clone().startOf('day')}
                startDate={this.state.startDate}
                endDate={this.state.endDate.clone().startOf('day')} />
          </Fieldset>
        }

        <Fieldset id="advisor-reports" data-jumptarget title={
          <span>
            Advisor Reports
          </span>
          }>
          <FilterableAdvisorReportsTable />
        </Fieldset>
      </div>
    )
  }

}
