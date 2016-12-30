import React, {Component} from 'react'

const css = {
	background: process.env.REACT_APP_SECURITY_COLOR,
	color: 'white',
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	fontSize: '18px',
	textAlign: 'center',
	zIndex: 101
}

export default class SecurityBanner extends Component {
	render() {
		return (
			<div className="security" style={css}>
				{process.env.REACT_APP_SECURITY_MARKING}
				{' '}||{' '}
				{window.ANET_DATA.currentUser}
				{' '}||{' '}
				{this.props.location.pathname}
			</div>
		)
	}
}
