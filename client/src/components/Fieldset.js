import React, {Component, PropTypes} from 'react'

export default class Fieldset extends Component {
	static propTypes = {
		title: PropTypes.node,
		action: PropTypes.node,
	}

	render() {
		let {title, action, ...props} = this.props

		return <div>
			<h2 className="legend">
				{title}
				{action && <small>{action}</small>}
			</h2>

			<fieldset {...props} />
		</div>
	}
}
