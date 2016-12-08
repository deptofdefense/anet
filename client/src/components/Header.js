import React from 'react'
import {Link} from 'react-router'
import {Button} from 'react-bootstrap'

import logo from '../resources/logo.png'

const background = {
	background: 'white',
	paddingTop: '58px',
	height: '132px',
	boxShadow: '0 4px 3px 0 rgba(0,0,0,0.1)',
	marginBottom: '32px'
}

export default class Header extends React.Component {
	render() {
		return (
			<div style={background}>
				<div className="container">
					<Link to="/">
						<img src={logo} alt="ANET logo" width={164} />
					</Link>

					{this.props.children}

					<Button bsStyle="primary" className="pull-right">Create</Button>
				</div>
			</div>
		)
	}
}
