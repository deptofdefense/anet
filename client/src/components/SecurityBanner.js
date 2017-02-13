import React, {Component, PropTypes} from 'react'

const SETTING_KEY_TEXT = 'SECURITY_BANNER_TEXT'
const SETTING_KEY_COLOR = 'SECURITY_BANNER_COLOR'

const css = {
	color: 'white',
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	fontSize: '18px',
	textAlign: 'center',
	zIndex: 101,
}


export default class SecurityBanner extends Component {
	static propTypes = {
		location: PropTypes.object.isRequired,
	}

	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	render() {
		let app = this.context.app
		let {currentUser, settings} = app.state

		return (
			<div className="security" style={{...css, background: settings[SETTING_KEY_COLOR]}}>
				{settings[SETTING_KEY_TEXT]}
				{' '}||{' '}
				{currentUser.name}
			</div>
		)
	}
}
