import React, {Component, PropTypes} from 'react'
import {Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'
import LinkTo from 'components/LinkTo'

import {Organization} from 'models'

export default class extends Component {
	static contextTypes = {
		app: PropTypes.object.isRequired,
	}

	render() {
		let appData = this.context.app.state
		let currentUser = appData.currentUser
		let organizations = appData.organizations || []
		let path = this.context.app.props.location.pathname
		let inOrg = path.indexOf("/organizations") === 0
		if (inOrg) { path = "/organizations/" + this.context.app.props.params.id }

		return (
			<Nav bsStyle="pills" stacked>
				<Link to="/">
					<NavItem>Home</NavItem>
				</Link>

				{currentUser && <Link to={"search?type=reports&authorId=" + currentUser.id}>
					<NavItem>My Reports</NavItem>
				</Link>
				}

				<NavDropdown title="EFs / AOs" id="organizations" active={inOrg}>
					{Organization.map(organizations, org =>
						<LinkTo organization={org} componentClass={Link} key={org.id}>
							<MenuItem>{org.shortName}</MenuItem>
						</LinkTo>
					)}
				</NavDropdown>

				{inOrg &&
					<SubNav>
						<Link to={path}><NavItem>Details</NavItem></Link>
						<Link to={path + "/approvals"}><NavItem>Approvals</NavItem></Link>
						<Link to={path + "/reports"}><NavItem>Reports</NavItem></Link>
						<Link to={path + "/laydown"}><NavItem>Laydown</NavItem></Link>
					</SubNav>
				}

				<Link to="/rollup">
					<NavItem>Daily Rollup</NavItem>
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
			</Nav>
		)
	}
}

class SubNav extends Component {
	render() {
		return <li>
			<Nav>
				{this.props.children}
			</Nav>
		</li>
	}
}
