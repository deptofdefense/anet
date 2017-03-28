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
		value: PropTypes.oneOfType([
			PropTypes.object,
			PropTypes.array,
			PropTypes.string,
		]),
		onChange: PropTypes.func,

		//All other properties are passed directly to the Autocomplete.

	}

	//TODO: how do you set initial state of this component given a query?
	// not sure how other components do this.


	constructor(props) {
		super(props)

		//I don't know why I can't use state, but it's annoyning.
		// I think it's safe because our onChange changes our parents state
		// and that should cause us to re-render anyways.
		this.value = props.value
		if (this.value[this.props.queryKey]) {
			this.value = {id : this.value[this.props.queryKey]}
		}
		this.includeChildOrgs = false
	}

	render() {
		let autocompleteProps = Object.without(this.props, 'value', 'queryKey', 'queryIncludeChildOrgsKey')
		console.log("rendering org auto", this.props.queryKey, this.value)
		return <div>
			<Autocomplete
				{...autocompleteProps}
				onChange={this.onChange}
				value={this.value}
			/>
			<Checkbox inline onChange={this.toggleChild}>Include children organizations</Checkbox>
		</div>
	}

	@autobind
	toggleChild() {
		this.includeChildOrgs = !this.includeChildOrgs

		this.updateQuery()
	}

	@autobind
	onChange(event) {
		this.value = event

		this.updateQuery()
	}

	@autobind
	updateQuery() {
		let query = {}
		query[this.props.queryKey] = this.value.id
		query[this.props.queryIncludeChildOrgsKey] = this.includeChildOrgs
		this.props.onChange(query)
	}
}
