import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import {Form as BSForm, FormGroup, Col, ControlLabel, FormControl, InputGroup} from 'react-bootstrap'

let activeFormContext = []

export class Form extends React.Component {
	componentWillMount() {
		activeFormContext.push(this.props.formFor)
	}

	componentWillUnmount() {
		while (activeFormContext.indexOf(this.props.formFor) !== -1)
			activeFormContext.pop()
	}

	componentDidMount() {
		let container = ReactDOM.findDOMNode(this.refs.container)
		let focusElement = container.querySelector('[data-focus]')
		if (focusElement) focusElement.focus()
	}

	render() {
		const {
			formFor,
			...formProps
		} = this.props

		console.log('formFor', formFor)

		return (
			<BSForm {...formProps} ref="container" />
		)
	}
}

Form.propTypes = Object.assign({}, BSForm.propTypes, {
	formFor: React.PropTypes.object
})

class HorizontalFormFieldCol extends React.Component {
	render() {
		return <Col {...this.props} />
	}
}

class HorizontalFormField extends React.Component {
	render() {
		let {
			id,
			className,
			label,
			addon,
			children,
			...childProps
		} = this.props

		label = label || _.upperFirst(_.startCase(id).toLowerCase())

		let extra
		if (Array.isArray(children)) {
			extra = children.find((child) => child.type === HorizontalFormFieldCol)
			if (extra) children.splice(children.indexOf(extra), 1)
		} else if (typeof children === 'object' && children.type === HorizontalFormFieldCol) {
			extra = children
			children = null
		}

		let content
		if (this.props.type === 'static')
			content = <FormControl.Static>{children || this.props.value}</FormControl.Static>
		else
			content = children || <FormControl {...childProps} value={this.getValue(id)} onChange={this.onChange.bind(this, id)} />

		return (
			<FormGroup controlId={id} className={className}>
				<Col sm={2} componentClass={ControlLabel}>
					{label}
				</Col>
				<Col sm={7}>
					{addon ? (<InputGroup>{content}<InputGroup.Addon>{addon}</InputGroup.Addon></InputGroup>) : content}
				</Col>
				{extra}
			</FormGroup>
		)
	}

	getValue(key) {
		let formContext = activeFormContext[activeFormContext.length - 1]
		return formContext[key]
	}

	onChange(key, event) {
		let formContext = activeFormContext[activeFormContext.length - 1]
		return formContext[key] = event.target.value
	}
}

HorizontalFormField.Col = HorizontalFormFieldCol

export {HorizontalFormField}
