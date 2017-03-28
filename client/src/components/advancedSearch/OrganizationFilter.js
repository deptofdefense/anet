import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import {Checkbox} from 'react-bootstrap'
import 'utils'
import Autocomplete from 'components/Autocomplete'

export default class OrganizationFilter extends Component {
	static propTypes = {
		//An Autocomplete filter allows users to search the ANET database
		// for existing records and use that records ID as the search term.
		// the filterKey property tells this filter what property to set on the
		// search query. (ie authorId, organizationId, etc)
		queryKey: PropTypes.string.isRequired,
		queryIncludeChildOrgsKey: PropTypes.string.isRequired,

		//Passed by the SearchFilter row
		value: PropTypes.any,
		onChange: PropTypes.func,

		//All other properties are passed directly to the Autocomplete.

	}

	constructor(props) {
		super(props)

		this.state = {
			value: props.value || {},
			includeChildOrgs: props.value.includeChildOrgs || false,
		}
	}

	@autobind
	toQuery() {
		return {
			[this.props.queryKey]: this.state.value.id,
			[this.props.queryIncludeChildOrgsKey]: this.state.includeChildOrgs,
		}
	}

	render() {
		let autocompleteProps = Object.without(this.props, 'value', 'queryKey', 'queryIncludeChildOrgsKey')
		console.log("rendering org auto", this.props.queryKey, this.value)
		return <div>
			<Autocomplete
				{...autocompleteProps}
				onChange={this.onChange}
				value={this.state.value}
			/>
			<Checkbox inline value={this.state.includeChildOrgs} onChange={this.toggleChild}>Include children organizations</Checkbox>
		</div>
	}

	@autobind
	toggleChild() {
		this.setState({includeChildOrgs: !this.state.includeChildOrgs}, this.updateFilter)
	}

	@autobind
	onChange(event) {
		this.setState({value: event}, this.updateFilter)
	}

	@autobind
	updateFilter() {
		let value = this.state.value
		value.includeChildOrgs = this.state.includeChildOrgs
		value.toQuery = this.toQuery
		this.props.onChange(value)
	}
}
