import React, {Component, PropTypes} from 'react'
import utils from 'utils'
import deepEqual from 'deep-equal'
import autobind from 'autobind-decorator'
import {FormGroup, Col, ControlLabel, FormControl, InputGroup} from 'react-bootstrap'

class FormFieldExtraCol extends Component {
	render() {
		return <Col sm={3} {...this.props} />
	}
}

export default class FormField extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {value: ''}
	}
	static contextTypes = {
		formFor: PropTypes.object,
		form: PropTypes.object,
	}

	static propTypes = {
		// Specifying an id prop on a FormField contained inside a Form with
		// a formFor prop will cause the FormField to be autobound to the formFor
		// value. That is to say, its value will be set to formForObject[idProp],
		// and when the FormField changes, formForObject[idProp] will automatically
		// be updated. The form will then have its own onChange fired to allow
		// you to update state or rerender.
		id: PropTypes.string.isRequired,
		label: PropTypes.string,

		// if you need to do additional formatting on the value returned by
		// formForObject[idProp], you can specify a getter function which
		// will be called with the value as its prop
		getter: PropTypes.func,

		// This will cause the FormField to be rendered as an InputGroup,
		// with the node specified by addon appended on the right of the group.
		addon: PropTypes.node,

		// If you pass children, we will try to autobind them to the id key
		// if any of the children have propTypes that include onChange
		children: PropTypes.node,

		// If you don't pass children, we will automatically create a FormControl.
		// You can use componentClass to override its type (for example, for a select).
		componentClass: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
		]),

		// If you don't want autobinding behavior, you can override them here
		value: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.object,
			PropTypes.bool,
		]),

		onChange: PropTypes.func,
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

		childProps = Object.without(childProps, 'getter', 'horizontal')

		let validationState = this.props.validationState
		let horizontal = this.context.form && this.context.form.props.horizontal
		if (typeof this.props.horizontal !== 'undefined') {
			horizontal = this.props.horizontal
		}

		if (typeof label === 'undefined') {
			label = utils.sentenceCase(id)
		}

		// Remove an ExtraCol from children first so we can manually append it
		// as a column
		children = React.Children.toArray(children)
		let extra = children.find(child => child.type === FormFieldExtraCol)
		if (extra)
			children.splice(children.indexOf(extra), 1)

		let defaultValue = this.getDefaultValue(this.props, this.context)

		let state = this.state
		if (Array.isArray(defaultValue))
			state.value = Array.from(defaultValue)
		else
			state.value = defaultValue

		// if type is static, render out a static value
		if (this.props.type === 'static' || (!this.props.type && this.context.form.props.static)) {
			children = <FormControl.Static componentClass={'div'} {...childProps}>{(children.length && children) || defaultValue}</FormControl.Static>

		// if children are provided, render those, but special case them to
		// automatically set value and children props
		} else if (!this.props.componentClass && children.length) {
			children = children.map(child => {
				let propTypes = child.type.propTypes

				// check to see if this is some kind of element where we
				// can register an onChange handler, otherwise skip it
				if (propTypes && !propTypes.onChange)
					return child

				return React.cloneElement(child, {value: defaultValue, onChange: child.props.onChange || this.onChange})
			})

		// otherwise render out a default FormControl input element
		} else {
			if (children.length)
				childProps.children = children

			children = <FormControl {...childProps} value={defaultValue} onChange={this.props.onChange || this.onChange} />
		}

		// if there's an addon we need to use an InputGroup
		if (addon) {
			// allows passing a url for an image
			if (addon.indexOf('.') !== -1) {
				addon = <img src={addon} height={20} role="presentation" />
			}

			children = <InputGroup>
				{children}
				<InputGroup.Addon onClick={this.focus}>{addon}</InputGroup.Addon>
			</InputGroup>
		}

		return (
			<FormGroup controlId={id} className={className} validationState={validationState}>
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

	shouldComponentUpdate(newProps, newState, newContext) {
		let newValue = this.getDefaultValue(newProps, newContext)
		let oldValue = this.state.value

		if (newValue !== oldValue) {
			return true
		}

		if (Array.isArray(newValue)) {
			return !deepEqual(newValue, oldValue)
		}

		if (!deepEqual(this.props, newProps)) {
			return true
		}

		return false
	}

	getValue(props, context) {
		let formContext = context.formFor
		let id = props.id
		let getter = props.getter
		if (formContext) {
			let value = formContext[id]
			return getter ? getter(value) : value
		}
	}

	getDefaultValue(props, context) {
		return props.value || this.getValue(props, context) || ''
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

	@autobind
	focus() {
		let element = document.getElementById(this.props.id)
		if (element && element.focus) {
			element.focus()
		}
	}
}

FormField.ExtraCol = FormFieldExtraCol
