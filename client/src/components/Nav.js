import React, {Component} from 'react'
import {Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'

import API from 'api'
import Organization from 'models'

export default class extends Component {
	constructor(props) {
		super(props)
		this.state = {
			organizations: [],
		}
	}

	componentDidMount() {
		API.query(/* GraphQL */`
			organizations(f:getAllOrgs, pageNum:0, pageSize:200) {
				id, name
				parentOrg { id }
			}
		`).then(data =>
			this.setState({
				organizations: Organization.fromArray(
					data.organizations.filter(org => org.parentOrg === null)
				)
			})
		)
	}

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
					<NavItem>My Reports</NavItem>
				</Link>

				<NavDropdown title="Organizations" id="organizations">
					{this.state.organizations.map(org =>
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
			</Nav>
		)
	}
}
