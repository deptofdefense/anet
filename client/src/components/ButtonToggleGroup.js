import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {ButtonGroup, Button} from 'react-bootstrap'

export default class ButtonToggleGroup extends Component {
	static propTypes = {
		value: PropTypes.string,
		onChange: PropTypes.func,
	}

	render() {
		let {children, ...props} = this.props

		return (
			<ButtonGroup {...props}>
				{children.map((child, index) => {
					if (!child) { return null }

					return <Button key={child.props.value}
						{...child.props}
						active={this.props.value === child.props.value}
						onClick={this.onClick} value={child.props.value} >
							{child.props.children}
					</Button>
				})}
			</ButtonGroup>
		)
	}

	@autobind
	onClick(event) {
		this.props.onChange(event.currentTarget.value)
	}
}
