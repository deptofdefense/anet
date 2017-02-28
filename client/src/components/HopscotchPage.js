import Page from 'components/Page'

import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.css'
import hopscotchTour from 'pages/HopscotchTour'

export default class HopscotchPage extends Page {
	constructor() {
		super()
		this.hopscotch = hopscotch
		this.hopscotchTour = hopscotchTour
	}

	componentDidMount() {
		super.componentDidMount()
		hopscotch.listen('error', onHopscotchError)
	}

	componentWillUnmount() {
		hopscotch.unlisten('error', onHopscotchError)
	}
}

function onHopscotchError(err) {
	console.error('Hopscotch could not find an element on the page.')
}
