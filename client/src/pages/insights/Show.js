import React, {PropTypes} from 'react'
import Page from 'components/Page'
import NotApprovedReports from 'components/NotApprovedReports'
import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'
import Fieldset from 'components/Fieldset'
import CalendarButton from 'components/CalendarButton'
import autobind from 'autobind-decorator'
import moment from 'moment'


const calendarButtonCss = {
  marginLeft: '20px',
  marginTop: '-8px',
}

export default class InsightsShow extends Page {
  static contextTypes = {
    app: PropTypes.object.isRequired,
  }

  get dateLongStr() { return this.state.date.format('DD MMMM YYYY') }

  constructor(props) {
    super(props)

    this.state = {
      date: moment().subtract(15, 'days')
    }
  }

  @autobind
  changeDate(newDate) {
    let date = moment(newDate)
    if (date.valueOf() !== this.state.date.valueOf()) {
      this.setState({date: date})
    }
  }

  render() {
    return (
      <div>
        <Breadcrumbs items={[[`Insights`, 'insights/']]} />
        <Messages error={this.state.error} success={this.state.success} />
        <Fieldset title={
          <span>
            Not Approved Reports - {this.dateLongStr}
            <CalendarButton onChange={this.changeDate} value={this.state.date.toISOString()} style={calendarButtonCss} />
          </span>
          }>
            <p className="help-text">Number of reports not approved since {this.dateLongStr}</p>
            <NotApprovedReports date={this.state.date} />
        </Fieldset>
      </div>
    )
  }

}
