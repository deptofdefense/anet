import React, {Component} from 'react'
import Autosuggest from 'react-autosuggest'
import {FormControl} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import API from 'api'

import './Autocomplete.css'

export default class Autocomplete extends Component {
	static propTypes = {
		value: React.PropTypes.oneOfType([
			React.PropTypes.object,
			React.PropTypes.array,
		]),
		valueKey: React.PropTypes.string,
		clearOnSelect: React.PropTypes.bool,
		url: React.PropTypes.string.isRequired,
		template: React.PropTypes.func,
		onChange: React.PropTypes.func,
		urlParams: React.PropTypes.string
	}

	constructor(props) {
		super(props)

		let value = this.componentWillReceiveProps(props)

		this.state = {
			suggestions: [],
			value: value,
			stringValue: this.getStringValue(value),
		}
	}

	componentWillReceiveProps(props) {
		let value = props.value
		if (Array.isArray(value)) {
			this.selectedIds = value.map(object => object.id)
			value = {}
		}

		//Ensure that we update the stringValue if we get an updated value
		let state = this.state
		if (state) {
			state.stringValue = this.getStringValue(value)
			this.setState(state)
		}

		return value
	}

	render() {
		let inputProps = Object.without(this.props, 'url', 'clearOnSelect', 'valueKey', 'template', 'urlParams')
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
			let url = this.props.url + '?text=' + value.value
			if (this.props.urlParams) {
				if (this.props.urlParams[0] !== '&') {
					url += "&"
				}
				url += this.props.urlParams
			}

			let selectedIds = this.selectedIds

			API.fetch(url, {showLoader: false}).then(data => {
				if (selectedIds)
					data = data.filter(suggestion => suggestion && suggestion.id && selectedIds.indexOf(suggestion.id) === -1)

				this.setState({suggestions: data})
			})
		}
	}

	@autobind
	clearSuggestions() {
		this.setState({suggestions: []})
	}

	@autobind
	onSuggestionSelected(event, {suggestion, suggestionValue}) {
		event.stopPropagation()
		event.preventDefault()

		let stringValue = this.props.clearOnSelect ? '' : suggestionValue
		this.setState({value: suggestion, stringValue})

		if (this.props.onChange)
			this.props.onChange(suggestion)
	}

	@autobind
	onInputChange(event) {
		if (!event.target.value) { //Clear the suggestion
			this.onSuggestionSelected(event, {suggestion: {}, suggestionValue: ''})
		} else {
			this.setState({stringValue: event.target.value})
		}
		event.stopPropagation()
	}
}
