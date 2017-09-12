import React, {PropTypes} from 'react'
import Page from 'components/Page'
import autobind from 'autobind-decorator'
import moment from 'moment'

import Fieldset from 'components/Fieldset'
import Breadcrumbs from 'components/Breadcrumbs'
import CalendarButton from 'components/CalendarButton'
import Messages from 'components/Messages'
import NotApprovedReports from 'components/NotApprovedReports'


const calendarButtonCss = {
  marginLeft: '20px',
  marginTop: '-8px',
}

export default class InsightsShow extends Page {
  static propTypes = {
    date: React.PropTypes.object,
  }

  static contextTypes = {
    app: PropTypes.object.isRequired,
  }

  get dateStr() { return this.state.date.format('DD MMM YYYY') }
  get dateLongStr() { return this.state.date.format('DD MMMM YYYY') }

  constructor(props) {
    super(props)

    this.state = {
      date: moment(+props.date || +props.location.query.date || undefined),
    }
  }

  componentWillReceiveProps(newProps, newContext) {
    let newDate = moment(+newProps.location.query.date || undefined)
    if (!this.state.date.isSame(newDate)) {
      this.setState({date: newDate}, () => this.loadData(newProps, newContext))
    } else {
      super.componentWillReceiveProps(newProps, newContext)
    }
  }

  render() {
    return (
      <div>
        <Breadcrumbs items={[[`Insights for ${this.dateStr}`, 'rollup/']]} />
        <Messages error={this.state.error} success={this.state.success} />

        <Fieldset title={
          <span>
            Insights - {this.dateLongStr}
            <CalendarButton onChange={this.changeRollupDate} value={this.state.date.toISOString()} style={calendarButtonCss} />
          </span>
        } />
        <p className="help-text">Number of reports not approved after 15 days</p>
        <NotApprovedReports daysCount="15"/>
      </div>
    )
  }

  @autobind
  changeRollupDate(newDate) {
    let date = moment(newDate)
    History.replace({pathname: 'insights', query: {date: date.valueOf()}})
  }

}
