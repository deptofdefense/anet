import React from 'react'
import {Breadcrumb} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'

export default class Breadcrumbs extends React.Component {
	makeItem(item) {
		return (
			<Link key={item[0]} to={item[1]}>
				<Breadcrumb.Item>{item[0]}</Breadcrumb.Item>
			</Link>
		)
	}

	render() {
		return (
			<Breadcrumb>
				{this.makeItem(['ANET', '/'])}
				{this.props.items.map(this.makeItem)}
			</Breadcrumb>
		)
	}
}

Breadcrumbs.defaultProps = {items: []}
