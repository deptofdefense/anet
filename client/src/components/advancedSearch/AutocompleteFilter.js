import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import 'utils'
import Autocomplete from 'components/Autocomplete'

export default class AutocompleteFilter extends Component {
	static propTypes = {
		//An Autocomplete filter allows users to search the ANET database
		// for existing records and use that records ID as the search term.
		// the filterKey property tells this filter what property to set on the
		// search query. (ie authorId, organizationId, etc)
		queryKey: PropTypes.string.isRequired,

		//Passed by the SearchFilter row
		value: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.array,
			PropTypes.string,
		]),
		onChange: PropTypes.func,

		//All other properties are passed directly to the Autocomplete.

	}

	constructor(props) {
		super(props)

		//I don't know why I can't use state, but it's annoyning.
		// I think it's safe because our onChange changes our parents state
		// and that should cause us to re-render anyways.
		this.value = props.value
		if (this.value[this.props.queryKey]) {
			this.value = {id : this.value[this.props.queryKey]}
		}
		console.log('autocomplete cons', props.value, this.value)
	}

	render() {
		console.log("rendering", this.props.queryKey, this.value)
		let autocompleteProps = Object.without(this.props, 'value', 'queryKey')
		return <Autocomplete
			{...autocompleteProps}
			onChange={this.onChange}
			value={this.value}
		/>
	}

	@autobind
	onChange(event) {
		this.value = event
		console.log("onChange", event, this.props.queryKey)
		let query = {}
		query[this.props.queryKey] = event.id
		this.props.onChange(query)
	}
}
