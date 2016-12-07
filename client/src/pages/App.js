import React from 'react'
import {Link} from 'react-router'

import SecurityBanner from '../components/SecurityBanner'
import Header from '../components/Header'

export default class App extends React.Component {
	render() {
		return (
			<div className="anet">
				<SecurityBanner />
				<Header />

				<div>
					<Link to="/">Home</Link>
					<Link to="/reports/new">Submit a report</Link>
					<Link to="/reports">My AO</Link>
				</div>

				{this.props.children}
			</div>
		)
	}
}
