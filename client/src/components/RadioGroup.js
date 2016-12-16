import React from 'react'
import {ButtonGroup, Button, Radio} from 'react-bootstrap'

export default class RadioGroup extends React.Component {
	constructor(props) {
		super(props)
		this.state = {selected: null}

		this.onRadioChange = this.onRadioChange.bind(this)
		this.onButtonClick = this.onButtonClick.bind(this)
	}

	render() {
		let size = this.props.size || "large"
		let id = this.getId()

		return (
			<ButtonGroup bsSize={size} data-toggle="buttons">
				{this.props.children.map((child, index) =>
					<Button key={child.props.value} active={this.state.selected === child.props.value} onClick={this.onButtonClick}>
						<Radio onChange={this.onRadioChange} {...child.props} inline id={id + '-' + child.props.value} name={id} />
					</Button>
				)}
			</ButtonGroup>
		)
	}

	getId() {
		let formGroup = this.context.$bs_formGroup
		return this.props.id || (formGroup && formGroup.controlId)
	}

	onButtonClick(event) {
		let clicked = event.target.querySelector('[type=radio]')
		if (clicked) {
			this.setState({selected: clicked.value})
			if (this.props.onChange) this.props.onChange(clicked.value)
		}
	}

	onRadioChange(event) {
		let checked = document.querySelector("[name='" + this.getId() + "']:checked")
		if (checked) {
			this.setState({selected: checked.value})
			if (this.props.onChange) this.props.onChange(checked.value)
		}
	}
}

RadioGroup.contextTypes = {$bs_formGroup: React.PropTypes.object}
