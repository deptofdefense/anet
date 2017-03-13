import React, {Component, PropTypes} from 'react'

class FieldsetTitle extends Component {
	render() {
		return <div>{this.props.children}</div>
	}
}

export default class Fieldset extends Component {
	static propTypes = {
		title: PropTypes.node,
		action: PropTypes.node,
	}

	render() {
		let {title, action, children, ...props} = this.props

		children = React.Children.toArray(children)
		let titleChild = children.find(child => child.type === FieldsetTitle)
		if (titleChild) {
			children.splice(children.indexOf(titleChild), 1)
		}

		return <div>
			<h2 className="legend">
				{titleChild || title}
				{action && <small>{action}</small>}
			</h2>

			<fieldset {...props}>
				{children}
			</fieldset>
		</div>
	}
}

Fieldset.Title = FieldsetTitle
