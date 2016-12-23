import React from 'react'
import _ from 'lodash'
import {FormGroup, Col, ControlLabel, FormControl, InputGroup} from 'react-bootstrap'

class FormFieldExtraCol extends React.Component {
	render() {
		return <Col sm={3} {...this.props} />
	}
}

export default class FormField extends React.Component {
	static contextTypes = {
		formFor: React.PropTypes.object,
		form: React.PropTypes.object,
	}

	render() {
		let {
			id,
			className,
			label,
			addon,
			children,
			...childProps
		} = this.props

		let horizontal = this.context.form && this.context.form.props.horizontal

		label = label || _.upperFirst(_.startCase(id).toLowerCase())

		children = React.Children.toArray(children)
		let extra = children.find((child) => child.type === FormFieldExtraCol)
		if (extra) children.splice(children.indexOf(extra), 1)
		if (children.length === 0) children = null

		let content
		if (this.props.type === 'static')
			content = <FormControl.Static>{children || this.props.value}</FormControl.Static>
		else
			content = children || <FormControl {...childProps} defaultValue={this.getValue()} />

		if (addon) {
			content = <InputGroup>
				{content}
				<InputGroup.Addon>{addon}</InputGroup.Addon>
			</InputGroup>
		}

		return (
			<FormGroup controlId={id} className={className}>
				{horizontal
					? <Col sm={2} componentClass={ControlLabel}>{label}</Col>
					: <ControlLabel>{label}</ControlLabel> }
				{horizontal
					? <Col sm={7}>{content}</Col>
					: content }
				{extra}
			</FormGroup>
		)
	}

	getValue() {
		let formContext = this.context.formFor
		let key = this.props.id
		if (formContext) return formContext[key]
	}
}

FormField.ExtraCol = FormFieldExtraCol
