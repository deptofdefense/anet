import React from 'react'

import SecurityBanner from '../components/SecurityBanner'

export default class App extends React.Component {
	render() {
		return (
			<div className="anet">
				<SecurityBanner />

				{this.props.children}
			</div>
		)
	}
}
