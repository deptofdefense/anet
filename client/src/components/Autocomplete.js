import React from 'react'
import Autosuggest from 'react-autosuggest'
import {FormControl} from 'react-bootstrap'

import API from '../api'

export default class Autcomplete extends React.Component {
	constructor(props) {
		super(props)
		this.state = {suggestions: [], value: this.props.value}

		this.onChange = this.onChange.bind(this)
		this.fetchSuggestions = this.fetchSuggestions.bind(this)
		this.clearSuggestions = this.clearSuggestions.bind(this)
		this.renderInputComponent = this.renderInputComponent.bind(this)
	}

	render() {
		let {url, value, onChange, ...inputProps} = this.props
		value = this.state.value
		onChange = this.onChange

		return (
			<Autosuggest
				suggestions={this.state.suggestions}
				onSuggestionsFetchRequested={this.fetchSuggestions}
				onSuggestionsClearRequested={this.clearSuggestions}
				getSuggestionValue={this.suggestionValue}
				renderSuggestion={this.renderSuggestion}
				inputProps={{...inputProps, value, onChange}}
				renderInputComponent={this.renderInputComponent}
			/>
		)
	}

	renderSuggestion(suggestion) {
		return <span>{suggestion.name}</span>
	}

	renderInputComponent(inputProps) {
		return <FormControl {...inputProps} inputRef={input => this.input = input} />
	}

	fetchSuggestions(value) {
		if (this.props.url) {
			API.fetch(this.props.url + '?q=' + value.value).then(data =>
				this.setState({suggestions: data})
			)
		}
		this.setState({suggestions: []})
	}

	clearSuggestions() {
		this.setState({suggestions: []})
	}

	suggestionValue(suggestion) {
		return suggestion.name
	}

	onChange(event, {newValue}) {
		this.setState({value: newValue})
		if (this.props.onChange) this.props.onChange(event, newValue)
	}
}
