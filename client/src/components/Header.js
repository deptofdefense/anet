import React, {Component} from 'react'
import {Link} from 'react-router'
import {Injectable, Injector} from 'react-injectables'

import SearchBar from 'components/SearchBar.js'
import CreateButton from 'components/CreateButton.js'

import logo from 'resources/logo.png'
import stringify from 'json-stringify-safe'

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
	shouldComponentUpdate(nextProps){
		let len = nextProps.injections && nextProps.injections.length
		let len2 = this.props.injections && this.props.injections.length
		if (len !== len2) return true
		nextProps.injections && nextProps.injections.forEach( (inj,ind) => {
			let a = this.props && this.props.injections[ind]
			let b = a && a.props
			if (b !== inj.props) return true
			if (stringify(b) !== stringify(inj.props)) return true
		})
		return false
	}
	render() {
		let leftContent, middleContent, rightContent
		this.props.injections.forEach(injection => {
			let content = injection.props.children

			if (content && content.props) {
				if (content.props.left)
					return leftContent = injection
				else if (content.props.right)
					return rightContent = injection
			}
			return middleContent = injection
		})

		return (
			<header style={backgroundCss} className="header">
				<div className="container">
					{leftContent || <Link to="/" className="pull-left">
						<img src={logo} alt="ANET logo" style={logoCss} />
					</Link>}

					<div className="pull-left header-content">
						{middleContent || <SearchBar />}
					</div>

					<div className="pull-right">
						{rightContent || <CreateButton />}
					</div>
				</div>
			</header>
		)
	}
}

let InjectableHeader = null
let ContentForHeader = null
if (process.env.NODE_ENV === 'test') {
	ContentForHeader = function(props) {
		return <div />
	}
} else {
	// this is some magic around the Injectable library to allow
	// components further down the tree to inject children into the header
	InjectableHeader = Injectable(Header)

	const HeaderInjector = Injector({into: InjectableHeader})
	ContentForHeader = function(props) {
		let {children, ...childProps} = props
		let Component = HeaderInjector(function() { return children })
		return <Component {...childProps} />
	}
}

export default InjectableHeader
export {ContentForHeader}
