import React, {PropTypes} from 'react'
import {withRouter} from 'react-router'
import _last from 'lodash.last'
import _get from 'lodash.get'

import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.css'
import {userTour, superUserTour} from 'pages/HopscotchTour'

export default function withHopscotch(WrappedPage) {
	return withRouter(class HopscotchPage extends React.Component {
		static contextTypes = {
			app: PropTypes.object
		}

		componentDidMount() {
			this.unsetRouteLeaveHook = this.props.router.setRouteLeaveHook(
				_last(this.props.routes),
				nextRoute => {
					if (!_get(nextRoute, ['state', 'continuingHopscotchTour'])) {
						hopscotch.endTour()
					}
				}
			)
			hopscotch.listen('error', onHopscotchError)
		}

		componentWillUnmount() {
			this.unsetRouteLeaveHook()
			hopscotch.unlisten('error', onHopscotchError)
		}

		render() {
			let {currentUser} = this.context.app.state
			let tour = currentUser.isSuperUser() ? superUserTour : userTour
			return <WrappedPage {...this.props} hopscotch={hopscotch} hopscotchTour={tour} />
		}
	})

	function onHopscotchError(err) {
		console.error('Hopscotch could not find an element on the page.')
	}
}
