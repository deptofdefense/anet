import React from 'react'
import _ from 'lodash'
import autobind from 'autobind-decorator'
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

		// Remove an ExtraCol from children first so we can manually append it
		// as a column
		children = React.Children.toArray(children)
		let extra = children.find(child => child.type === FormFieldExtraCol)
		if (extra)
			children.splice(children.indexOf(extra), 1)

		// If type is static, render out a static value
		if (this.props.type === 'static') {
			children = <FormControl.Static>{children || this.props.value}</FormControl.Static>
		} else if (children.length) {
			children = children.map(child => {
				let propTypes = child.type.propTypes
				if (propTypes && !propTypes.onChange)
					return child

				return React.cloneElement(child, {onChange: this.onChange})
			})
		} else {
			children = <FormControl {...childProps} defaultValue={this.getValue()} onChange={this.onChange} />
		}

		// if there's an addon we need to use an InputGroup
		if (addon) {
			children = <InputGroup>
				{children}
				<InputGroup.Addon>{addon}</InputGroup.Addon>
			</InputGroup>
		}

		return (
			<FormGroup controlId={id} className={className}>
				{horizontal
					? <Col sm={2} componentClass={ControlLabel}>{label}</Col>
					: <ControlLabel>{label}</ControlLabel> }
				{horizontal
					? <Col sm={7}>{children}</Col>
					: children }
				{extra}
			</FormGroup>
		)
	}

	getValue() {
		let formContext = this.context.formFor
		let id = this.props.id
		if (formContext)
			return formContext[id]
	}

	@autobind
	onChange(event) {
		let id = this.props.id
		let value = event && event.target ? event.target.value : event
		let formContext = this.context.formFor
		if (formContext)
			formContext[id] = value
		console.log(id, value, formContext);
	}
}

FormField.ExtraCol = FormFieldExtraCol
