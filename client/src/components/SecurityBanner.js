import React from 'react'

const style = {
	background: process.env.REACT_APP_SECURITY_COLOR,
	color: 'white',
	opacity: '0.8',
	position: 'fixed',
	top: 0,
	left: 0,
	width: '100%',
	fontSize: '18px',
	textAlign: 'center',
}

class SecurityBanner extends React.Component {
	render() {
		return (
			<div className="security" style={style}>
				{process.env.REACT_APP_SECURITY_MARKING}
			</div>
		)
	}
}

export default SecurityBanner
