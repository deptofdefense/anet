import React, {Component} from 'react'

const css = {
	top: 132,
	background: 'orange',
}

export default class NoPositionBanner extends Component {
	render() {
		return (
			<div className="banner" style={css}>
				You haven't been assigned to a Position. Contact your super user to be added.
			</div>
		)
	}

	componentWillMount() {
		document.body.classList.add('no-position')
	}

	componentWillUnmount() {
		document.body.classList.remove('no-position')
	}
}
