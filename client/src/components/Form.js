import React, {Component} from 'react'
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
		formFor: React.PropTypes.object,
		actionText: React.PropTypes.string,
		onSubmit: React.PropTypes.func,
		static: React.PropTypes.bool,
	})

	static childContextTypes = {
		formFor: React.PropTypes.object,
		form: React.PropTypes.object,
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
		let {children, actionText, ...bsProps} = this.props
		bsProps = Object.without(bsProps, 'formFor', 'static')

		if (this.props.static) {
			bsProps.componentClass = Row
			bsProps.style = bsProps.style || {}
			Object.assign(bsProps.style, staticFormStyle)
		}

		let showSubmit = bsProps.onSubmit && actionText !== false

		return (
			<BSForm {...bsProps} ref="container">
				{children}

				{showSubmit &&
					<ContentForHeader>
						<Button bsStyle="primary" type="submit" onClick={bsProps.onSubmit}>
							{actionText || "Save"}
						</Button>
					</ContentForHeader>
				}

				{showSubmit &&
					<fieldset>
						<Button bsStyle="primary" bsSize="large" type="submit" className="pull-right">
							{actionText || "Save"}
						</Button>
					</fieldset>
				}
			</BSForm>
		)
	}
}

// just a little sugar to make importing and building forms easier
Form.Field = FormField
