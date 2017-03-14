import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {Form as BSForm, Button} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import FormField from 'components/FormField'

export default class Form extends Component {
	static propTypes = Object.assign({}, BSForm.propTypes, {
		formFor: PropTypes.object,
		static: PropTypes.bool,
		submitText: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		submitOnEnter: PropTypes.bool,
		submitDisabled: PropTypes.bool,
		deleteText: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
		onChange: PropTypes.func,
		onSubmit: PropTypes.func,
		onDelete: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
	})

	static defaultProps = {
		static: false,
		submitOnEnter: false,
		submitText: "Save",
		deleteText: "Delete",
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
		let {children, submitText, submitOnEnter, submitDisabled, deleteText, onDelete, ...bsProps} = this.props
		bsProps = Object.without(bsProps, 'formFor', 'static')

		if (this.props.static) {
			submitText = false
			bsProps.componentClass = "div"
		}

		if (!submitOnEnter) {
			bsProps.onKeyDown = this.preventEnterKey
		}

		let showSubmit = bsProps.onSubmit && submitText !== false
		bsProps.onSubmit = this.onSubmit

		let showDelete = onDelete && deleteText !== false

		return (
			<BSForm {...bsProps} ref="container">
				{children}

				<div className="form-bottom-submit">
					{showSubmit &&
						<Button bsStyle="primary" bsSize="large" type="submit" disabled={submitDisabled} id="formBottomSubmit">
							{submitText}
						</Button>
					}

					{showDelete &&
						<Button bsStyle="warning" onClick={onDelete}>
							{deleteText}
						</Button>
					}
				</div>
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
