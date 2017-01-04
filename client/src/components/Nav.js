import React, {Component} from 'react'
import {Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import {LinkContainer as NestedLink, IndexLinkContainer as Link} from 'react-router-bootstrap'

import API from 'api'

export default class extends Component {
	static contextTypes = {
		app: React.PropTypes.object.isRequired,
	}

	render() {
		let app = this.context.app
		let currentUser = app.state.currentUser
		let organizations = app.state.organizations || []

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
					{organizations.map(org =>
						<Link to={"/organizations/" + org.id} key={org.id}>
							<MenuItem>{org.name}</MenuItem>
						</Link>
					)}
				</NavDropdown>


				{process.env.NODE_ENV === 'development' &&
					<Link to="/graphiql">
						<NavItem>GraphQL</NavItem>
					</Link>
				}

				{currentUser.role === 'ADMINISTRATOR' && <NestedLink to="/admin">
					<NavItem>Admin</NavItem>
				</NestedLink>}
			</Nav>
		)
	}
}
