import React, {Component, PropTypes} from 'react'
import {Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import hopscotch from 'hopscotch'
import 'hopscotch/dist/css/hopscotch.css'

import TOUR_ICON from 'resources/tour-icon.png'

const iconCss = {
	width: '20px',
	marginLeft: '8px',
}

export default class GuidedTour extends Component {
	static propTypes = {
		tour: PropTypes.func.isRequired,
		autostart: PropTypes.bool,
		onEnd: PropTypes.func,
	}

	static contextTypes = {
		currentUser: PropTypes.object.isRequired,
	}

	componentDidMount() {
		hopscotch.listen('end', this.onEnd)
		hopscotch.listen('close', this.onEnd)

		this.componentDidUpdate()
	}

	componentDidUpdate() {
		if (!this.runningTour && this.props.autostart && this.context.currentUser.id) {
			this.startTour()
		}
	}

	componentWillUnmount() {
		hopscotch.unlisten('end', this.onEnd)
		hopscotch.unlisten('close', this.onEnd)

		this.endTour()
	}

	render() {
		return <Button bsStyle="link" onClick={this.onClick} className="persistent-tour-launcher">
			New to ANET? Take a guided tour
			<img src={TOUR_ICON} className="tour-icon" role="presentation" style={iconCss} />
		</Button>
	}

	@autobind
	onClick() {
		this.startTour()
	}

	startTour(stepId) {
		let currentUser = this.context.currentUser
		let tour = this.props.tour(currentUser)

		hopscotch.startTour(tour, stepId)

		this.runningTour = true
	}

	endTour() {
		hopscotch.endTour()
		this.onEnd()

		this.runningTour = false
	}

	@autobind
	onEnd() {
		if (this.props.onEnd) {
			this.props.onEnd()
		}
	}
}
