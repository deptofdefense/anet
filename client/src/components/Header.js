import React, {Component} from 'react'
import {Link} from 'react-router'
import {Grid, Row, Col} from 'react-bootstrap'
import {Injectable, Injector} from 'react-injectables'

import SearchBar from 'components/SearchBar.js'
import CreateButton from 'components/CreateButton.js'

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

class Header extends Component {
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
				<Grid>
					<Row>
						<Col xs={3}>
							{leftContent || <Link to="/" className="logo">
								<img src={logo} alt="ANET logo" />
							</Link>}
						</Col>
						
						{ !this.props.minimalHeader && 
							<Col xs={7} className="middle-header">
								{middleContent || <SearchBar />}
							</Col>
						}

						{ !this.props.minimalHeader && 
							<Col xs={2}>
								<div className="pull-right">
									{rightContent || <CreateButton />}
								</div>
							</Col>
						}
					</Row>
				</Grid>
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
