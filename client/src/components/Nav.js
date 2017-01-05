import React, {Component} from 'react'
import {Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import {LinkContainer as NestedLink, IndexLinkContainer as Link} from 'react-router-bootstrap'

import {Organization} from 'models'

export default class extends Component {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	render() {
		let appData = this.context.app.state
		let currentUser = appData.currentUser
		let organizations = appData.organizations || []

		return (
			<Nav bsStyle="pills" stacked>
				<Link to="/">
					<NavItem>Home</NavItem>
				</Link>

				<Link to="/reports/new">
					<NavItem>Submit a report</NavItem>
				</Link>

				<Link to="/reports">
					<NavItem>My Reports</NavItem>
				</Link>

				<NavDropdown title="Organizations" id="organizations">
					{Organization.map(organizations, org =>
						<Link to={Organization.pathFor(org)} key={org}>
							<MenuItem>{org.name}</MenuItem>
						</Link>
					)}
				</NavDropdown>


				{process.env.NODE_ENV === 'development' &&
					<Link to="/graphiql">
						<NavItem>GraphQL</NavItem>
					</Link>
				}

				{currentUser.role === 'ADMINISTRATOR' &&
					<NestedLink to="/admin">
						<NavItem>Admin</NavItem>
					</NestedLink>
				}
			</Nav>
		)
	}
}
