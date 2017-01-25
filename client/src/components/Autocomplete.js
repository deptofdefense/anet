import React, {Component, PropTypes} from 'react'
import {FormControl} from 'react-bootstrap'
import Autosuggest from 'react-autosuggest-ie11-compatible'
import autobind from 'autobind-decorator'

import API from 'api'
import utils from 'utils'
import * as changeCase from 'change-case'

import './Autocomplete.css'

export default class Autocomplete extends Component {
	static propTypes = {
		value: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.array,
			PropTypes.string,
		]),
		valueKey: PropTypes.string,
		clearOnSelect: PropTypes.bool,
		template: PropTypes.func,
		onChange: PropTypes.func,
		queryParams: PropTypes.object,
		objectType: PropTypes.func,
		fields: PropTypes.string,
	}

	constructor(props) {
		super(props)

		let value = this.componentWillReceiveProps(props)

		this.state = {
			suggestions: [],
			noSuggestions: false,
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
		let inputProps = Object.without(this.props, 'url', 'clearOnSelect', 'valueKey', 'template', 'queryParams', 'objectType', 'fields')
		inputProps.value = this.state.stringValue
		inputProps.onChange = this.onInputChange
		return <div>
			<Autosuggest
				suggestions={this.state.noSuggestions ? [{}] : this.state.suggestions}
				onSuggestionsFetchRequested={this.fetchSuggestions}
				onSuggestionsClearRequested={this.clearSuggestions}
				onSuggestionSelected={this.onSuggestionSelected}
				getSuggestionValue={this.getStringValue}
				inputProps={inputProps}
				renderInputComponent={inputProps => <FormControl {...inputProps} />}
				renderSuggestion={this.renderSuggestion}
				focusInputOnSuggestionClick={false}
			/>
		</div>
	}

	@autobind
	renderSuggestion(suggestion) {
		if (this.state.noSuggestions) {
			return <span><i>No suggestions found</i></span>
		}

		let template = this.props.template
		if (template) {
			return template(suggestion)
		} else {
			return <span>{this.getStringValue(suggestion)}</span>
		}
	}

	@autobind
	getStringValue(suggestion) {
		return suggestion[this.props.valueKey] || ""
	}

	@autobind
	fetchSuggestions(value) {
		if(value.value.trim().length < 2) {
			this.setState({suggestions: [], noSuggestions: false})
			return
		}
		if (this.props.url) {
			let url = this.props.url + '?text=' + value.value
			if (this.props.queryParams) {
				url += "&" + utils.createUrlParams(this.props.queryParams);
			}

			let selectedIds = this.selectedIds

			API.fetch(url, {showLoader: false}).then(data => {
				if (selectedIds)
					data = data.filter(suggestion => suggestion && suggestion.id && selectedIds.indexOf(suggestion.id) === -1)

				let noSuggestions = data.length === 0
				this.setState({suggestions: data, noSuggestions})
			})
		} else {
			let resourceName = this.props.objectType.resourceName
			let resource = changeCase.camel(resourceName) + "s";
			let graphQlQuery = resource + "(f:search, query: $query) { "
					+ this.props.fields
					+ "}";
			let variableDef = "($query: " + resourceName + "SearchQuery)";
			let queryVars = { text: value.value }
			if (this.props.queryParams) {
				Object.forEach(this.props.queryParams, (key,val) => queryVars[key] = val)
			}

			API.query(graphQlQuery, { query: queryVars}, variableDef)
				.then(data => {
					let noSuggestions = data[resource].length === 0
					this.setState({suggestions: data[resource], noSuggestions})
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
		if (this.state.noSuggestions && stringValue !== ''){
			return
		}
		this.setState({value: suggestion, stringValue})

		if (this.props.onChange)
			this.props.onChange(suggestion)
	}

	@autobind
	onInputChange(event) {
		if (!event.target.value && !this.props.clearOnSelect) {
			//If the selection lives in this component, and the user just cleared the input
			// Then set the selection to empty.
			this.onSuggestionSelected(event, {suggestion: {}, suggestionValue: ''})
		} else {
			this.setState({stringValue: event.target.value})
		}
		event.stopPropagation()
	}
}
