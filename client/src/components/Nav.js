import React from 'react'
import {Nav, NavItem} from 'react-bootstrap'
import {IndexLinkContainer} from 'react-router-bootstrap'

export default class extends React.Component {
	render() {
		return (
			<Nav bsStyle="pills" stacked>
				<IndexLinkContainer to="/">
					<NavItem>Home</NavItem>
				</IndexLinkContainer>

				<IndexLinkContainer to="/reports/new">
					<NavItem>Submit a report</NavItem>
				</IndexLinkContainer>

				<IndexLinkContainer to="/reports">
					<NavItem>My AO</NavItem>
				</IndexLinkContainer>
			</Nav>
		)
	}
}
