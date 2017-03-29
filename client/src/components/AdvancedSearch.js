import React, {Component, PropTypes} from 'react'
import {Button, DropdownButton, MenuItem, Row, Col, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'
import autobind from 'autobind-decorator'
import _isequal from 'lodash.isequal'

import ButtonToggleGroup from 'components/ButtonToggleGroup'
import History from 'components/History'

import ReportStateSearch from 'components/advancedSearch/ReportStateSearch'
import DateRangeSearch from 'components/advancedSearch/DateRangeSearch'
import AutocompleteFilter from 'components/advancedSearch/AutocompleteFilter'
import OrganizationFilter from 'components/advancedSearch/OrganizationFilter'
import SelectSearchFilter from 'components/advancedSearch/SelectSearchFilter'

import {Person, Poam} from 'models'

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
			/>,

			"Engagement Date": <DateRangeSearch queryKey="engagementDate" />,
			"Release Date": <DateRangeSearch queryKey="releaseDate" />,

			Location: <AutocompleteFilter
				queryKey="locationId"
				valueKey="name"
				placeholder="Filter reports by location..."
				url="/api/locations/search"
			/>,

			PoAM: <AutocompleteFilter
				queryKey="poamId"
				objectType={Poam}
				fields={Poam.autocompleteQuery}
				template={Poam.autocompleteTemplate}
				valueKey="shortName"
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
				placeholder="Filter by location..."
				url="/api/locations/search"
			/>,
			//TODO: country
		}
	},
	Organizations: {
		filters: {
			Type: <SelectSearchFilter
				queryKey="type"
				values={["ADVISOR", "PRINCIPAL"]}
				labels={["NATO", "Afghan"]}
			  />,
		}
	},
	Positions: {
		filters: {
			Type: <SelectSearchFilter
				queryKey="type"
				values={["ADVISOR", "PRINCIPAL"]}
				labels={["Billet", "Tashkil"]}
			/>,
			Organization: <OrganizationFilter
				queryKey="organizationId"
				queryIncludeChildOrgsKey="includeChildrenOrgs"
			/>,
			Status: <SelectSearchFilter
				queryKey="status"
				values={["ACTIVE","INACTIVE"]}
			/>,
			Location: <AutocompleteFilter
				queryKey="locationId"
				valueKey="name"
				placeholder="Filter by location..."
				url="/api/locations/search"
			/>,
			"Is Filled?": <SelectSearchFilter
				queryKey="isFilled"
				values={["true","false"]}
				labels={["Yes","No"]}
			/>,
		}
	},
	Locations: {
		filters: {

		}
	},
	PoAMs: {
		filters: {
			Organization: <OrganizationFilter
				queryKey="responsibleOrgId"
				queryIncludeChildOrgsKey="includeChildrenOrgs"
			/>,
			Status: <SelectSearchFilter
				queryKey="status"
				values={["ACTIVE", "INACTIVE"]}
				labels={["Active", "Inactive"]}
			/>,
		}
	},
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
		console.log("RENDER AdvancedSearch", objectType, text, filters)
		let filterDefs = OBJECT_TYPES[this.state.objectType].filters
		let existingKeys = filters.map(f => f.key)

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
					<DropdownButton bsStyle="link" title="+ Add another filter" onSelect={this.addFilter} id="addFilterDropdown">
						{Object.keys(filterDefs).map(filterKey =>
							<MenuItem disabled={existingKeys.indexOf(filterKey) > -1} eventKey={filterKey} key={filterKey} >{filterKey}</MenuItem>
						)}
					</DropdownButton>
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
	addFilter(filterKey) {
		let filters = this.state.filters
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
			label = filter.key
			children = React.cloneElement(
				filterDefs[filter.key],
				{value: filter.value || "", onChange: this.onChange}
			)
		}

		return <FormGroup>
			<Col xs={3}><ControlLabel>{label}</ControlLabel></Col>
			<Col xs={8}>{children}</Col>
			<Col xs={1}>
				<Button bsStyle="link" onClick={() => onRemove(this.props.filter)}>
					<img src={REMOVE_ICON} height={14} alt="Remove this filter" />
				</Button>
			</Col>
		</FormGroup>
	}

	@autobind
	onChange(value) {
		let filter = this.props.filter
		filter.value = value
	}
}
