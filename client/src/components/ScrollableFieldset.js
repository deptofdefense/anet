import React, {Component, PropTypes} from 'react'

export default class ScrollableFieldset extends Component {
	static propTypes = {
		height: PropTypes.number.isRequired,
		title: PropTypes.string,
	}

	render() {
		let {title, height, children} = this.props

		return (
			<fieldset>
				{title && <legend>{title}</legend>}
				<div style={{maxHeight: height + "px", overflowY: "auto"}}>
					{children}
				</div>
			</fieldset>
		)
	}
}
