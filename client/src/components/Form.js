import React from 'react'
import ReactDOM from 'react-dom'
import {Form as BSForm} from 'react-bootstrap'

export default class Form extends React.Component {
	static propTypes = Object.assign({}, BSForm.propTypes, {
		formFor: React.PropTypes.object
	})

	static childContextTypes = {
		formFor: React.PropTypes.object,
		form: React.PropTypes.object,
	}

	getChildContext() {
		return {
			formFor: this.props.formFor,
			form: this
		}
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

		return (
			<BSForm {...formProps} ref="container" />
		)
	}
}
