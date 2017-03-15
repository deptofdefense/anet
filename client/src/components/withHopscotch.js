import React from 'react'

import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.css'
import hopscotchTour from 'pages/HopscotchTour'

export default function withHopscotch(WrappedPage) {
	return class HopscotchPage extends React.Component {
		componentDidMount() {
			hopscotch.listen('error', onHopscotchError)
		}

		componentWillUnmount() {
			hopscotch.unlisten('error', onHopscotchError)
		}

		render() {
			return <WrappedPage {...this.props} hopscotch={hopscotch} hopscotchTour={hopscotchTour} />
		}
	}

	function onHopscotchError(err) {
		console.error('Hopscotch could not find an element on the page.')
	}
}

