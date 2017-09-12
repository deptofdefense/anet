import React, {Component} from 'react'
import moment from 'moment'

import API from 'api'
import dict from 'dictionary'
import BarChart from 'components/BarChart'


export default class NotApprovedReports extends Component {

  constructor(props) {
    super(props)

    this.state = {
      graphData: [],
    }
  }

  get rollupStart() { return moment(this.state.date).subtract(100, 'days').startOf('day').hour(19) } //7pm yesterday
  get rollupEnd() { return moment(this.state.date).endOf('day').hour(18) } // 6:59:59pm today.

  render() {
    return <BarChart data={this.state.graphData} size={[500,500]} xProp='org.shortName' yProp='released' />
  }

  fetchData() {
    let graphQueryUrl = `/api/reports/rollupGraph?startDate=${this.rollupStart.valueOf()}&endDate=${this.rollupEnd.valueOf()}`
    if (this.state.focusedOrg) {
      if (this.state.orgType === 'PRINCIPAL_ORG') {
        graphQueryUrl += `&principalOrganizationId=${this.state.focusedOrg.id}`
      } else {
        graphQueryUrl += `&advisorOrganizationId=${this.state.focusedOrg.id}`
      }
    } else if (this.state.orgType) {
      graphQueryUrl += `&orgType=${this.state.orgType}`
    }

    let graphQuery = API.fetch(graphQueryUrl)
    let pinned_ORGs = dict.lookup('pinned_ORGs')

    Promise.all([graphQuery]).then(values => {
      this.setState({
        graphData: values[0]
          .map(d => {d.org = d.org || {id: -1, shortName: "Other"}; return d})
          .sort((a, b) => {
            let a_index = pinned_ORGs.indexOf(a.org.shortName)
            let b_index = pinned_ORGs.indexOf(b.org.shortName)
            if (a_index<0)
              return (b_index<0) ?  a.org.shortName.localeCompare(b.org.shortName) : 1
            else
              return (b_index<0) ? -1 : a_index-b_index
          })
      })
    })
  }  
  
  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps !== this.props) {
      this.fetchData()
    }
  }

  componentDidMount() {
    this.fetchData()
  }
}
