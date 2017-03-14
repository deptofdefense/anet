import React, {Component, PropTypes} from 'react'

export default class Fieldset extends Component {
	static propTypes = {
		title: PropTypes.node,
		action: PropTypes.node,
	}

	render() {
		let {id, title, action, ...props} = this.props

		return <div id={id}>
			<h2 className="legend">
				{title}
				{action && <small>{action}</small>}
			</h2>

			<fieldset {...props} />
		</div>
	}
}
