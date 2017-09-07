import React, {PropTypes} from 'react'
import Page from 'components/Page'

import Breadcrumbs from 'components/Breadcrumbs'
import Messages from 'components/Messages'


export default class InsightsShow extends Page {

  static contextTypes = {
    app: PropTypes.object.isRequired,
  }

  render() {
    return (
      <div>
        <Breadcrumbs items={[[`Insights`, 'insights/']]} />
        <Messages error={this.state.error} success={this.state.success} />
      </div>
    )
  }

}
