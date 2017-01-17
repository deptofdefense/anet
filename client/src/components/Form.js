import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Form as BSForm, Row, Button} from 'react-bootstrap'

import {ContentForHeader} from 'components/Header'
import FormField from 'components/FormField'

const staticFormStyle = {
	margin: 0,
	marginTop: '-30px',
}

export default class Form extends Component {
	static propTypes = Object.assign({}, BSForm.propTypes, {
		formFor: PropTypes.object,
		static: PropTypes.bool,
		submitText: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		submitOnEnter: PropTypes.bool,
		onSubmit: PropTypes.func,
	})

	static defaultProps = {
		static: false,
		submitText: 'Save',
		submitOnEnter: false,
	}

	static childContextTypes = {
		formFor: PropTypes.object,
		form: PropTypes.object,
	}

	getChildContext() {
		return {
			formFor: this.props.formFor,
			form: this,
		}
	}

	componentDidMount() {
		let container = ReactDOM.findDOMNode(this.refs.container)
		let focusElement = container.querySelector('[data-focus]')
		if (focusElement) focusElement.focus()
	}

	render() {
		let {children, submitText, submitOnEnter, ...bsProps} = this.props
		bsProps = Object.without(bsProps, 'formFor', 'static')

		if (this.props.static) {
			submitText = false
			bsProps.componentClass = Row
			bsProps.style = bsProps.style || {}
			Object.assign(bsProps.style, staticFormStyle)
		}

		if (!submitOnEnter) {
			bsProps.onKeyDown = this.preventEnterKey
		}

		let showSubmit = bsProps.onSubmit && submitText !== false

		return (
			<BSForm {...bsProps} ref="container">
				{children}

				{showSubmit &&
					<ContentForHeader right>
						<Button bsStyle="primary" type="submit" onClick={bsProps.onSubmit}>
							{submitText}
						</Button>
					</ContentForHeader>
				}

				{showSubmit &&
					<fieldset>
						<Button bsStyle="primary" bsSize="large" type="submit" className="pull-right">
							{submitText}
						</Button>
					</fieldset>
				}
			</BSForm>
		)
	}

	preventEnterKey(event) {
		if (event.key === 'Enter') {
			event.preventDefault()
			event.stopPropagation()
		}
	}
}

// just a little sugar to make importing and building forms easier
Form.Field = FormField
