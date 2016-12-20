import React from 'react'
import {Link} from 'react-router'
import {Button} from 'react-bootstrap'
import {Injectable, Injector} from 'react-injectables'

import SearchBar from './SearchBar.js'

import logo from '../resources/logo.png'

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

class Header extends React.Component {
	render() {
		return (
			<div style={backgroundCss}>
				<div className="container">
					<Link to="/" className="pull-left">
						<img src={logo} alt="ANET logo" style={logoCss} />
					</Link>

					<div className="pull-left header-content">
						{this.props.injections.length ? this.props.injections : <SearchBar />}
					</div>

					{/*<Button bsStyle="primary" className="pull-right">Create</Button>*/}
				</div>
			</div>
		)
	}
}

// this is some magic around the Injectable library to allow
// components further down the tree to inject children into the header
const InjectableHeader = Injectable(Header)
const HeaderInjector = Injector({into: InjectableHeader})
export default InjectableHeader
export function ContentForHeader(props) {
	let Injector = HeaderInjector(function() {
		return props.children
	})
	return <Injector />
}
