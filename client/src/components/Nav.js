import React from 'react'
import {Nav, NavItem} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'

export default class extends React.Component {
	render() {
		return (
			<Nav bsStyle="pills" stacked>
				<Link to="/">
					<NavItem>Home</NavItem>
				</Link>

				<Link to="/reports/new">
					<NavItem>Submit a report</NavItem>
				</Link>

				<Link to="/reports">
					<NavItem>Reports</NavItem>
				</Link>

				{process.env.NODE_ENV === 'development' && <Link to="/graphiql">
					<NavItem>GraphQL</NavItem>
				</Link>}
			</Nav>
		)
	}
}
