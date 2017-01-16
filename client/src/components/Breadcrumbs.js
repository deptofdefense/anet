import React, {PureComponent} from 'react'
import {Breadcrumb} from 'react-bootstrap'
import {IndexLinkContainer as Link} from 'react-router-bootstrap'

export default class Breadcrumbs extends PureComponent {
	makeItem(item) {
		return (
			<Link key={item[1]} to={item[1]}>
				<Breadcrumb.Item>{item[0]}</Breadcrumb.Item>
			</Link>
		)
	}

	render() {
		let {items, ...props} = this.props

		return (
			<Breadcrumb {...props}>
				{this.makeItem(['ANET', '/'])}
				{items.map(this.makeItem)}
			</Breadcrumb>
		)
	}
	shouldComponentUpdate(nextProps){
		return !(JSON.stringify(this.props) === JSON.stringify(nextProps))
	}
}

Breadcrumbs.defaultProps = {items: []}
