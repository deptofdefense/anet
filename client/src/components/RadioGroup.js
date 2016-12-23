import React from 'react'
import autobind from 'autobind-decorator'
import {ButtonGroup, Button, Radio} from 'react-bootstrap'

export default class RadioGroup extends React.Component {
	static contextTypes = {
		$bs_formGroup: React.PropTypes.object,
	}

	static propTypes = Object.assign({
		value: React.PropTypes.string,
		onChange: React.PropTypes.func,
	}, ButtonGroup.propTypes)

	constructor(props, context) {
		super(props, context)
		this.state = {value: props.value}

		let formGroup = context.$bs_formGroup
		this.id = props.id || (formGroup && formGroup.controlId)
	}

	render() {
		let {children, ...props} = this.props

		return (
			<ButtonGroup data-toggle="buttons" {...props}>
				{children.map((child, index) =>
					<Button key={child.props.value} active={this.state.value === child.props.value} onClick={this.onButtonClick}>
						<Radio
							id={this.id + '-' + child.props.value}
							name={this.id}
							{...child.props}
							onChange={this.onRadioChange}
							inline
							checked={this.state.value === child.props.value}
						/>
					</Button>
				)}
			</ButtonGroup>
		)
	}

	@autobind
	onButtonClick(event) {
		let element = event.target
		if (element && element.nodeName.toUpperCase() !== 'BUTTON')
			return

		let radio = element.querySelector('[type=radio]')
		this.setState({value: radio && radio.value})

		// since this isn't an actual form input changing, we need to manually
		// call our onChange event
		if (this.props.onChange)
			this.props.onChange(radio.value)
	}

	@autobind
	onRadioChange(event) {
		let checked = event.target
		this.setState({value: checked.value})
	}
}
