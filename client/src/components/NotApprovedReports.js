import React, {Component} from 'react'
import API from 'api'
import dict from 'dictionary'

import BarChart from 'components/BarChart'
import ReportCollection from 'components/ReportCollection'


/*
 * Component displaying a chart with reports submitted for approval up to
 * the given date but which have not been approved yet.
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
    }
  }

  render() {
    if (this.state.graphData.length) {
      return <BarChart data={this.state.graphData} size={[500,500]} xProp='advisorOrg.id' yProp='notApproved' xLabel='advisorOrg.shortName' />
    }
    else {
      return <div>No such reports.</div>
    }
  }

  fetchData() {
    const insightQuery = {
      state: ['PENDING_APPROVAL'],
      updatedAtEnd: this.state.date.valueOf(),
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
        graphData: values[0].reportList.list
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
