import React, {Component, PropTypes} from 'react'
import {FormControl} from 'react-bootstrap'
import Autosuggest from 'react-autosuggest-ie11-compatible'
import autobind from 'autobind-decorator'
import _debounce from 'lodash.debounce'

import API from 'api'
import utils from 'utils'

import './Autocomplete.css'

import SEARCH_ICON from 'resources/search.png'

export default class Autocomplete extends Component {
	static propTypes = {
		value: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.array,
			PropTypes.string,
		]),

		//The property of the selected object to display.
		valueKey: PropTypes.string,

		//If this Autocomplete should clear the text area after a valid selection.
		clearOnSelect: PropTypes.bool,

		//Optional: A function to render each item in the list of suggestions.
		template: PropTypes.func,

		//Function to call when a selection is made.
		onChange: PropTypes.func,

		//Optional: Function to call when the error state changes.
		// Specifically if the user leaves invalid text in the component.
		onErrorChange: PropTypes.func,

		//Optional: Parameters to pass to search function.
		queryParams: PropTypes.object,

		//Optional: ANET Object Type (Person, Report, etc) to search for.
		objectType: PropTypes.func,

		//GraphQL string of fields to return from search.
		fields: PropTypes.string,
	}

	constructor(props) {
		super(props)

		this.fetchSuggestionsDebounced = _debounce(this.fetchSuggestions, 200)

		let value = this.componentWillReceiveProps(props)
		let stringValue = this.getStringValue(value)

		this.state = {
			suggestions: [],
			noSuggestions: false,
			value: value,
			stringValue,
			originalStringValue: stringValue,
		}
	}

	componentWillReceiveProps(props) {
		let value = props.value
		if (Array.isArray(value)) {
			this.selectedIds = value.map(object => object.id)
			return {}
		}

		//Ensure that we update the stringValue if we get an updated value
		if (this.state) {
			let stringValue = this.getStringValue(value)
			this.setState({stringValue, originalStringValue: stringValue})
		}

		return value
	}

	render() {
		let inputProps = Object.without(this.props, 'url', 'clearOnSelect', 'valueKey', 'template', 'queryParams', 'objectType', 'fields', 'onErrorChange')
		inputProps.value = this.state.stringValue
		inputProps.onChange = this.onInputChange
		inputProps.onBlur = this.onInputBlur

		return <div>
			<Autosuggest
				suggestions={this.state.noSuggestions ? [{}] : this.state.suggestions}
				onSuggestionsFetchRequested={this.fetchSuggestionsDebounced}
				onSuggestionsClearRequested={this.clearSuggestions}
				onSuggestionSelected={this.onSuggestionSelected}
				getSuggestionValue={this.getStringValue}
				inputProps={inputProps}
				renderInputComponent={this.renderInputComponent}
				renderSuggestion={this.renderSuggestion}
				focusInputOnSuggestionClick={false}
			/>

			<img src={SEARCH_ICON} className="form-control-icon" role="presentation" />
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
	renderInputComponent(inputProps) {
		return <FormControl {...inputProps} />
	}

	@autobind
	getStringValue(suggestion) {
		if (typeof suggestion === 'object' ) {
			return suggestion[this.props.valueKey] || ''
		}
		return suggestion
	}

	@autobind
	fetchSuggestions(value) {
		if (this.props.url) {
			let url = this.props.url + '?text=' + value.value + "*"

			let queryParams = this.props.queryParams || {}
			if (!queryParams.pageSize) {
				queryParams.pageSize = 25
			}

			if (queryParams) {
				url += '&' + utils.createUrlParams(queryParams)
			}

			let selectedIds = this.selectedIds

			API.fetch(url, {showLoader: false}).then(data => {
				data = data.list
				if (selectedIds)
					data = data.filter(suggestion => suggestion && suggestion.id && selectedIds.indexOf(suggestion.id) === -1)

				let noSuggestions = data.length === 0
				this.setState({suggestions: data, noSuggestions})
			})
		} else {
			let resourceName = this.props.objectType.resourceName
			let listName = this.props.objectType.listName
			let graphQlQuery = listName + '(f:search, query: $query) { '
					+ 'list { ' + this.props.fields + '}'
					+ '}'
			let variableDef = '($query: ' + resourceName + 'SearchQuery)'
			let queryVars = {text: value.value + "*", pageSize: 25}
			if (this.props.queryParams) {
				Object.assign(queryVars, this.props.queryParams)
			}

			API.query(graphQlQuery, {query: queryVars}, variableDef)
				.then(data => {
					let noSuggestions = data[listName].list.length === 0
					this.setState({suggestions: data[listName].list, noSuggestions})
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
//		if (this.state.noSuggestions && stringValue !== ''){
//			return
//		}
		this.currentSelected = suggestion
		this.setState({value: suggestion, stringValue})

		if (this.props.onChange) {
			this.props.onChange(suggestion)
		}

		if (this.props.onErrorChange) {
			//Clear any error state.
			this.props.onErrorChange(false)
		}
	}

	@autobind
	onInputChange(event) {
		if (!event.target.value) {
			if (!this.props.clearOnSelect) {
				//If the selection lives in this component, and the user just cleared the input
				// Then set the selection to empty.
				this.onSuggestionSelected(event, {suggestion: {}, suggestionValue: ''})
			}
			if (this.props.onErrorChange) {
				this.props.onErrorChange(false) //clear any errors.
			}
		}

		//The user is typing!
		this.currentSelected = null
		this.setState({stringValue: event.target.value})
		event.stopPropagation()
	}

	@autobind
	onInputBlur(event) {
		if (this.currentSelected) { return }
		// If the user clicks off this Autocomplete with a value left in the Input Box
		// Send that up to the parent. The user probably thinks they just 'set' this value
		// so we should oblige, _unless_ the value is the original string value that was
		// passed in. In this case, they probably tabbed past the field, so we should
		// do nothing.
		let val = this.state.stringValue
		if (val) {
			if (val === this.state.originalStringValue) { return }

			this.setState({value: val, stringValue: val})
			if (this.props.onErrorChange) {
				this.props.onErrorChange(true, val)
			} else if (this.props.onChange) {
				this.props.onChange(val)
			}
		}
	}
}
