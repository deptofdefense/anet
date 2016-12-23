import React from 'react'
import Autosuggest from 'react-autosuggest'
import {FormControl} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import API from '../api'

import './Autocomplete.css'

export default class Autcomplete extends React.Component {
	static propTypes = {
		value: React.PropTypes.object,
		valueKey: React.PropTypes.string,
		clearOnSelect: React.PropTypes.bool,
		url: React.PropTypes.string.isRequired,
		template: React.PropTypes.func,
		onChange: React.PropTypes.func,
	}

	constructor(props) {
		super(props)

		let value = props.value || {}
		this.state = {
			suggestions: [],
			value: value,
			stringValue: this.getStringValue(value),
		}
	}

	render() {
		let inputProps = Object.without(this.props, 'url', 'clearOnSelect', 'valueKey', 'template')
		inputProps.value = this.state.stringValue
		inputProps.onChange = this.onInputChange

		return (
			<Autosuggest
				suggestions={this.state.suggestions}
				onSuggestionsFetchRequested={this.fetchSuggestions}
				onSuggestionsClearRequested={this.clearSuggestions}
				onSuggestionSelected={this.onSuggestionSelected}
				getSuggestionValue={this.getStringValue}
				inputProps={inputProps}
				renderInputComponent={inputProps => <FormControl {...inputProps} />}
				renderSuggestion={this.renderSuggestion}
				focusInputOnSuggestionClick={false}
			/>
		)
	}

	@autobind
	renderSuggestion(suggestion) {
		let template = this.props.template
		if (template)
			return template(suggestion)
		else
			return <span>{this.getStringValue(suggestion)}</span>
	}

	@autobind
	getStringValue(suggestion) {
		return suggestion[this.props.valueKey] || ""
	}

	@autobind
	fetchSuggestions(value) {
		if (this.props.url) {
			let url = this.props.url + '?q=' + value.value
			API.fetch(url, {showLoader: false}).then(data =>
				this.setState({suggestions: data})
			)
		}
	}

	@autobind
	clearSuggestions() {
		this.setState({suggestions: []})
	}

	@autobind
	onSuggestionSelected(event, {suggestion, suggestionValue}) {
		let stringValue = this.props.clearOnSelect ? '' : suggestionValue
		this.setState({value: suggestion, stringValue})

		if (this.props.onChange)
			this.props.onChange(suggestion)
	}

	@autobind
	onInputChange(event) {
		this.setState({stringValue: event.target.value})
		event.stopPropagation()
	}
}
