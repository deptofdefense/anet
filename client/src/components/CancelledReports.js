import React, {Component} from 'react'
import API from 'api'
import dict from 'dictionary'

import BarChart from 'components/BarChart'
import ReportCollection from 'components/ReportCollection'


/*
 * Component displaying a chart with reports cancelled since
 * the given date.
 */
export default class CancelledReports extends Component {
  static propTypes = {
    date: React.PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      date: props.date,
      graphDataByOrg: [],
      graphDataByReason: [],
    }
  }

  render() {
    if (this.state.graphDataByOrg.length) {
      return <div>
          <BarChart data={this.state.graphDataByOrg} xProp='advisorOrg.id' yProp='cancelledByOrg' xLabel='advisorOrg.shortName' />
          <BarChart data={this.state.graphDataByReason} xProp='reason' yProp='cancelledByReason' />
        </div>
    }
    else {
      return <div>No such reports.</div>
    }
  }

  fetchData() {
    const insightQuery = {
      state: ['CANCELLED'],
      releasedAtStart: this.state.date.valueOf(),
      pageSize: 0,  // retrieve all the filtered reports
    }

    let reportQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$insightQuery) {
          totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {insightQuery}, '($insightQuery: ReportSearchQuery)')

    let pinned_ORGs = dict.lookup('pinned_ORGs')

    Promise.all([reportQuery]).then(values => {
      this.setState({
        graphDataByOrg: values[0].reportList.list
          .filter((item, index, d) => d.findIndex(t => {return t.advisorOrg.id === item.advisorOrg.id }) === index)
          .map(d => {d.cancelledByOrg = values[0].reportList.list.filter(item => item.advisorOrg.id === d.advisorOrg.id).length; return d})
          .sort((a, b) => {
            let a_index = pinned_ORGs.indexOf(a.advisorOrg.shortName)
            let b_index = pinned_ORGs.indexOf(b.advisorOrg.shortName)
            if (a_index < 0)
              return (b_index < 0) ?  a.advisorOrg.shortName.localeCompare(b.advisorOrg.shortName) : 1
            else
              return (b_index < 0) ? -1 : a_index-b_index
          }),
        graphDataByReason: values[0].reportList.list
          .filter((item, index, d) => d.findIndex(t => {return t.cancelledReason === item.cancelledReason }) === index)
          .map(d => {d.cancelledByReason = values[0].reportList.list.filter(item => item.cancelledReason === d.cancelledReason).length; return d})
          .map(d => {d.reason = d.cancelledReason.replace("CANCELLED_", "").replace(/_/g, " ").toLocaleLowerCase().replace(/(\b\w)/gi, function(m) {return m.toUpperCase()}); return d})
          .sort((a, b) => {
            return a.reason.localeCompare(b.reason)
        })
      })
    })
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
