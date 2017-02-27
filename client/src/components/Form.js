import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Form as BSForm, Row, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import _isEqual from 'lodash.isequal'

import {ContentForHeader} from 'components/Header'
import FormField from 'components/FormField'

const staticFormStyle = {
	margin: 0,
	marginTop: '-30px',
}

export default class Form extends Component {
	static propTypes = Object.assign({}, BSForm.propTypes, {
		formFor: PropTypes.object,
		originalFormFor: PropTypes.object,
		static: PropTypes.bool,
		submitText: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		submitOnEnter: PropTypes.bool,
		submitDisabled: PropTypes.bool,
		onSubmit: PropTypes.func,
		onChange: PropTypes.func,
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

	@autobind
	onBeforeUnloadListener(event) {
		if (!_isEqual(this.props.formFor, this.props.originalFormFor)) {
			event.returnValue = 'Are you sure you wish to navigate away from the page? You will lose unsaved changes.'
			event.preventDefault()
		}
	}

	componentWillMount() {
		window.addEventListener('beforeunload', this.onBeforeUnloadListener)
	}

	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.onBeforeUnloadListener)
	}

	componentDidMount() {
		let container = ReactDOM.findDOMNode(this.refs.container)
		let focusElement = container.querySelector('[data-focus]')
		if (focusElement) focusElement.focus()
	}

	render() {
		let {children, submitText, submitOnEnter, submitDisabled, ...bsProps} = this.props
		bsProps = Object.without(bsProps, 'formFor', 'originalFormFor', 'static')

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
		bsProps.onSubmit = this.onSubmit

		return (
			<BSForm {...bsProps} ref="container">
				{children}

				{showSubmit &&
					<ContentForHeader right>
						<Button bsStyle="primary" type="submit" onClick={bsProps.onSubmit} disabled={submitDisabled} id="formHeaderSubmit" >
							{submitText}
						</Button>
					</ContentForHeader>
				}

				{showSubmit &&
					<div className="form-bottom-submit">
						<Button bsStyle="primary" bsSize="large" type="submit" disabled={submitDisabled} id="formBottomSubmit">
							{submitText}
						</Button>
					</div>
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

	@autobind
	onSubmit(event) {
		event.stopPropagation()
		event.preventDefault()

		this.props.onSubmit && this.props.onSubmit(event)
	}
}

// just a little sugar to make importing and building forms easier
Form.Field = FormField
