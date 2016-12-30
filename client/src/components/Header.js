import React, {Component} from 'react'
import {Link} from 'react-router'
import {Injectable, Injector} from 'react-injectables'

import SearchBar from 'components/SearchBar.js'

import logo from 'resources/logo.png'

const backgroundCss = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	background: '#fff',
	paddingTop: '58px',
	height: '132px',
	boxShadow: '0 4px 3px 0 rgba(0,0,0,0.1)',
	zIndex: 100
}

const logoCss = {
	width: '164px',
}

class Header extends Component {
	render() {
		return (
			<header style={backgroundCss} className="header">
				<div className="container">
					<Link to="/" className="pull-left">
						<img src={logo} alt="ANET logo" style={logoCss} />
					</Link>

					<div className="pull-left header-content">
						{this.props.injections[0] || <SearchBar />}
					</div>

					<div className="pull-right">
						{this.props.injections[1]}
					</div>
				</div>
			</header>
		)
	}
}

// this is some magic around the Injectable library to allow
// components further down the tree to inject children into the header
const InjectableHeader = Injectable(Header)
export default InjectableHeader

const HeaderInjector = Injector({into: InjectableHeader})
export function ContentForHeader(props) {
	let {children, ...childProps} = props
	let Component = HeaderInjector(function() { return children })
	return <Component {...childProps} />
}
