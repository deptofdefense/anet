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

		let defaultValue = this.props.value || this.getValue()

		// if type is static, render out a static value
		if (this.props.type === 'static') {
			children = <FormControl.Static>{(children.length && children) || defaultValue}</FormControl.Static>

		// if children are provided, render those, but special case them to
		// automatically set value and children props
		} else if (children.length) {
			children = children.map(child => {
				let propTypes = child.type.propTypes

				// check to see if this is some kind of element where we
				// can register an onChange handler, otherwise skip it
				if (propTypes && !propTypes.onChange)
					return child

				return React.cloneElement(child, {value: defaultValue, onChange: this.onChange})
			})

		// otherwise render out a default FormControl input element
		} else {
			children = <FormControl {...childProps} defaultValue={defaultValue} onChange={this.onChange} />
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

		let form = this.context.form
		if (form && form.props.onChange) {
			form.props.onChange(event)
			event && event.stopPropagation && event.stopPropagation()
		}
	}
}

FormField.ExtraCol = FormFieldExtraCol
