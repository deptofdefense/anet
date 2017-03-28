import React, {Component, PropTypes} from 'react'
import {Button, Row, Col, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'
import autobind from 'autobind-decorator'

import ButtonToggleGroup from 'components/ButtonToggleGroup'
import History from 'components/History'

import ReportStateSearch from 'components/advancedSearch/ReportStateSearch'
import DateRangeSearch from 'components/advancedSearch/DateRangeSearch'
import AutocompleteFilter from 'components/advancedSearch/AutocompleteFilter'
import OrganizationFilter from 'components/advancedSearch/OrganizationFilter'
import SelectSearchFilter from 'components/advancedSearch/SelectSearchFilter'

import {Person, Organization, Poam} from 'models'

import REMOVE_ICON from 'resources/delete.png'

const OBJECT_TYPES = {
	Reports: {
		filters: {
			Author: <AutocompleteFilter
				queryKey="authorId"
				objectType={Person}
				valueKey="name"
				fields={Person.autocompleteQuery}
				template={Person.autocompleteTemplate}
				placeholder="Filter reports by author..."
			/>,

			Attendee: <AutocompleteFilter
				queryKey="attendeeId"
				objectType={Person}
				valueKey="name"
				fields={Person.autocompleteQuery}
				template={Person.autocompleteTemplate}
				placeholder="Filter reports by attendee..."
			/>,

			Organization: <OrganizationFilter
				queryKey="orgId"
				queryIncludeChildOrgsKey="includeOrgChildren"
				objectType={Organization}
				valueKey="shortName"
				value=""
				url="/api/organizations/search"
				placeholder="Filter reports by organization..."
			/>,

			"Engagement Date": <DateRangeSearch queryKey="enagementDate" />,
			"Release Date": <DateRangeSearch queryKey="releaseDate" />,

			Location: <AutocompleteFilter
				queryKey="locationId"
				valueKey="name"
				placeholder="Filter reports by location..."
				url="/api/locations/search"
			/>,

			"PoAM": <AutocompleteFilter
				queryKey="poamId"
				objectType={Poam}
				fields={Poam.autocompleteQuery}
				template={Poam.autocompleteTemplate}
				placeholder="Filter reports by PoAM..."
			/>,

			State: <ReportStateSearch />,
			Atmosphere: <SelectSearchFilter
				queryKey="atmosphere"
				values={["POSITIVE","NEUTRAL","NEGATIVE"]}
			/>
		}
	},

	People: {
		filters: {
			Organization: <OrganizationFilter
				queryKey="orgId"
				queryIncludeChildOrgsKey="includeChildOrgs"
				objectType={Organization}
				valueKey="shortName"
				value=""
				url="/api/organizations/search"
				placeholder="Filter reports by organization..."
			/>,
			Role: <SelectSearchFilter
				queryKey="role"
				values={["ADVISOR","PRINCIPAL"]}
				labels={["NATO Member", "Afghan Principal"]}
			/>,
			Status: <SelectSearchFilter
				queryKey="status"
				values={["ACTIVE","INACTIVE","NEW_USER"]}
			/>,
			Location: <AutocompleteFilter
				queryKey="locationId"
				valueKey="name"
				placeholder="Filter reports by location..."
				url="/api/locations/search"
			/>,
			//TODO: country
		}
	},
	Organizations: "ORGANIZATIONS",
	Positions: "POSITIONS",
	Locations: "POSITIONS",
	PoAMs: "POSITIONS",
}

export default class AdvancedSearch extends Component {
	static propTypes = {
		onSearch: PropTypes.func,
	}

	constructor(props) {
		super(props)

		let query = props || {}
		this.state = {
			objectType: query.objectType || "Reports",
			text: query.text || "",
			filters: query.filters || [{key: "Author"}],
		}
	}

	componentWillReceiveProps(props) {
		if (props.query) {
			this.setState(props.query)
		}
	}

	render() {
		let {objectType, text, filters} = this.state

		return <div className="advanced-search form-horizontal">
			<FormGroup style={{textAlign: "center"}}>
				<ButtonToggleGroup value={objectType} onChange={this.changeObjectType}>
					{Object.keys(OBJECT_TYPES).map(type =>
						<Button key={type} value={type}>{type}</Button>
					)}
				</ButtonToggleGroup>
			</FormGroup>

			<SearchFilter label="Search term" onRemove={() => this.setState({text: ""})}>
				<FormControl value={text} onChange={this.setText} />
			</SearchFilter>

			{filters.map(filter =>
				<SearchFilter key={filter.key} query={this.state} filter={filter} onRemove={this.removeFilter} />
			)}

			<Row>
				<Col xs={3} xsOffset={3}>
					<Button bsStyle="link" onClick={this.addFilter}>+ Add another filter</Button>
				</Col>
			</Row>

			<Row>
				<div className="pull-right">
					<Button onClick={this.props.onCancel} style={{marginRight: 20}}>Cancel</Button>
					<Button bsStyle="primary" onClick={this.performSearch} style={{marginRight: 20}}>Search</Button>
				</div>
			</Row>
		</div>
	}

	@autobind
	changeObjectType(objectType) {
		this.setState({objectType, filters: []}, () => this.addFilter())
	}

	@autobind
	addFilter() {
		let filters = this.state.filters
		let filterDefs = OBJECT_TYPES[this.state.objectType].filters
		if (!filterDefs) { return }

		let allKeys = Object.keys(filterDefs)
		let filterKey
		for (var i = 0, count = allKeys.length; i < count; i++) {
			if (!filters.find(filter => filter.key === allKeys[i])) {
				filterKey = allKeys[i]
				break
			}
		}

		if (filterKey) {
			filters.push({key: filterKey})
			this.setState({filters})
		}
	}

	@autobind
	removeFilter(filter) {
		let filters = this.state.filters
		filters.splice(filters.indexOf(filter), 1)
		this.setState({filters})
	}

	@autobind
	setText(event) {
		this.setState({text: event.target.value})
	}

	@autobind
	performSearch() {
		let queryState = {objectType: this.state.objectType, filters: this.state.filters, text: this.state.text}
		if (!this.props.onSearch || this.props.onSearch(queryState) !== false) {
			History.push('/search', {advancedSearch: queryState})
		}
	}
}

class SearchFilter extends Component {
	static propTypes = {
		label: PropTypes.string,
		onRemove: PropTypes.func,

		query: PropTypes.object,
		filter: PropTypes.object,
	}

	render() {
		let {label, onRemove, query, filter, children} = this.props

		if (query) {
			let filterDefs = OBJECT_TYPES[query.objectType].filters
			label = <select onChange={this.onFilterTypeChange} value={filter.key}>
				{Object.keys(filterDefs).map(filterKey =>
					<option key={filterKey} value={filterKey}>{filterKey}</option>
				)}
			</select>

			children = React.cloneElement(
				filterDefs[filter.key],
				{value: filter.value || "", onChange: this.onChange}
			)
		}

		return <FormGroup>
			<Col xs={3}><ControlLabel>{label}</ControlLabel></Col>
			<Col xs={8}>{children}</Col>
			<Col xs={1}>
				<Button bsStyle="link" onClick={() => onRemove(this.filter)}>
					<img src={REMOVE_ICON} height={14} alt="Remove this filter" />
				</Button>
			</Col>
		</FormGroup>
	}

	@autobind
	onFilterTypeChange(event) {
		let filter = this.props.filter
		filter.key = event.target.value
		filter.value = ""
		this.forceUpdate()
	}

	@autobind
	onChange(event) {
		if (!event) { return }
		let filter = this.props.filter

		// simple text value
		if (event.target) {
			filter.value = {[filter.key]: event.target.value}
		// autocomplete result
		} else if (event.id) {
			filter.value = event
		// complex components that will return their query params directly
		} else {
			filter.value = event
		}

		this.forceUpdate()
	}
}
