import React, {Component, PropTypes} from 'react'
import {Nav as BSNav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'
import {Injectable, Injector} from 'react-injectables'
import {Scrollspy} from 'react-scrollspy'

import LinkTo from 'components/LinkTo'

import {Organization} from 'models'

class Nav extends Component {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	render() {
		let injections = this.props.injections
		if (injections && injections.length) {
			return <div>{injections}</div>
		}

		let appData = this.context.app.state
		let currentUser = appData.currentUser
		let organizations = appData.organizations || []
		let path = this.context.app.props.location.pathname

		let inAdmin = path.indexOf('/admin') === 0
		let inOrg = path.indexOf('/organizations') === 0
		let inMyReports = path.indexOf('/reports/mine') === 0

		let orgId, myOrgId
		if (inOrg) {
			orgId = +this.context.app.props.params.id
			myOrgId = currentUser.position.organization && +currentUser.position.organization.id
			path = `/organizations/${orgId}`
		}

		let orgSubNav = (
			<SubNav
				componentClass={Scrollspy}
				className="nav"
				items={['info', 'laydown', 'approvals', 'poams', 'reports']}
				currentClassName="active"
				offset={-152}
			>
				<NavItem href="#info">Info</NavItem>
				<NavItem href="#laydown">Laydown</NavItem>
				<NavItem href="#approvals">Approvals</NavItem>
				<NavItem href="#poams">PoAMs</NavItem>
				<NavItem href="#reports">Reports</NavItem>
			</SubNav>
		)

		return (
			<BSNav bsStyle="pills" stacked id="leftNav" className="nav-fixed">
				<Link to="/">
					<NavItem>Home</NavItem>
				</Link>

				 {currentUser.id && <Link to={{pathname: '/reports/mine'}}>
						<NavItem>My Reports</NavItem>
				</Link>}

				{inMyReports && 
					<SubNav
						componentClass={Scrollspy}
						className="nav"
						items={['draft-reports', 'pending-approval', 'published-reports']}
						currentClassName="active"
						offset={-152}
					>
						<NavItem href="#draft-reports">Draft reports</NavItem>
						<NavItem href="#pending-approval">Pending approval</NavItem>
						<NavItem href="#published-reports">Published reports</NavItem>
					</SubNav>
				}

				{currentUser.position.organization && <Link to={Organization.pathFor(currentUser.position.organization)}>
					<NavItem>My Organization</NavItem>
				</Link>}

				{inOrg && orgId === myOrgId && orgSubNav}

				<NavDropdown title="All EFs / AOs" id="organizations" active={inOrg && orgId !== myOrgId}>
					{Organization.map(organizations, org =>
						<LinkTo organization={org} componentClass={Link} key={org.id}>
							<MenuItem>{org.shortName}</MenuItem>
						</LinkTo>
					)}
				</NavDropdown>

				{inOrg && orgId !== myOrgId && orgSubNav}

				<Link to="/rollup">
					<NavItem>Daily rollup</NavItem>
				</Link>

				{process.env.NODE_ENV === 'development' &&
					<Link to="/graphiql">
						<NavItem>GraphQL</NavItem>
					</Link>
				}

				{currentUser.isAdmin() &&
					<Link to="/admin">
						<NavItem>Admin</NavItem>
					</Link>
				}
				{currentUser.isAdmin() && inAdmin &&
					<SubNav>
						<Link to={"/admin/mergePeople"}><NavItem>Merge people</NavItem></Link>
					</SubNav>
				}
			</BSNav>
		)
	}
}

function SubNav(props) {
	let {componentClass, ...childProps} = props
	let Component = componentClass || BSNav
	return <li>
		<Component {...childProps} />
	</li>
}

let InjectableNav = null
let ContentForNav = null
if (process.env.NODE_ENV === 'test') {
	ContentForNav = function(props) {
		return <div />
	}
} else {
	// this is some magic around the Injectable library to allow
	// components further down the tree to inject children into the header
	InjectableNav = Injectable(Nav)

	const NavInjector = Injector({into: InjectableNav})
	ContentForNav = function(props) {
		let {children, ...childProps} = props
		let Component = NavInjector(function() { return children })
		return <Component {...childProps} />
	}
}

export default InjectableNav
export {ContentForNav}
