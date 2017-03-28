import React, {Component, PropTypes} from 'react'
import {Button, Col, FormGroup, FormControl, ControlLabel} from 'react-bootstrap'
import DatePicker from 'react-bootstrap-date-picker'
import autobind from 'autobind-decorator'
import utils from 'utils'

import ButtonToggleGroup from 'components/ButtonToggleGroup'
import Autocomplete from 'components/Autocomplete'
import History from 'components/History'

import {Person, Organization, Poam} from 'models'

import REMOVE_ICON from 'resources/delete.png'

const OBJECT_TYPES = {
	Reports: {
		filters: {
			author: <Autocomplete
				objectType={Person}
				valueKey="name"
				fields={Person.autocompleteQuery}
				template={Person.autocompleteTemplate}
				placeholder="Filter reports by author..."
			/>,

			attendee: <Autocomplete
				objectType={Person}
				valueKey="name"
				fields={Person.autocompleteQuery}
				template={Person.autocompleteTemplate}
				placeholder="Filter reports by attendee..."
			/>,

			organization: <Autocomplete
				objectType={Organization}
				valueKey="shortName"
				value=""
				url="/api/organizations/search"
				placeholder="Filter reports by organization..."
			/>,

			engagementDate: <DatePicker showTodayButton showClearButton={false} />,
			releaseDate: <DatePicker />,

			location: <Autocomplete valueKey="name" placeholder="Filter reports by location..." url="/api/locations/search" />,

			poam: <Autocomplete
				objectType={Poam}
				fields={Poam.autocompleteQuery}
				template={Poam.autocompleteTemplate}
				placeholder="Filter reports by PoAM..."
			/>,

			state: <select>
				<option value="DRAFT">Draft</option>
				<option value="PENDING">Pending</option>
				<option value="RELEASED">Released</option>
				<option value="CANCELLED">Cancelled</option>
				<option value="FUTURE">Future</option>
			</select>,
		}
	},

	People: "PEOPLE",
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

		this.state = props.query || {
			objectType: "Reports",
			text: "",
			filters: [{key: "author"}],
		}
	}

	componentWillReceiveProps(props) {
		if (props.query) {
			this.setState(props.query)
		}
	}

	render() {
		let {objectType, text, filters} = this.state

		return <div>
			<FormGroup style={{textAlign: "center"}}>
				<ButtonToggleGroup value={objectType} onChange={this.changeObjectType}>
					{Object.keys(OBJECT_TYPES).map(type =>
						<Button key={type} value={type}>{type}</Button>
					)}
				</ButtonToggleGroup>
			</FormGroup>

			<SearchFilter label="Search for:" onRemove={() => this.setState({text: ""})}>
				<FormControl value={text} onChange={this.setText} />
			</SearchFilter>

			{filters.map(filter =>
				<SearchFilter key={filter.key} query={this.state} filter={filter} parent={this} />
			)}

			<Button onClick={this.addFilter}>+ Add another filter</Button>

			<div className="submit-buttons">
				<Button bsStyle="primary" onClick={this.performSearch}>Search</Button>
			</div>
		</div>
	}

	@autobind
	changeObjectType(objectType) {
		this.setState({query: {objectType, filters: []}})
	}

	@autobind
	addFilter() {
		let filters = this.state.filters
		let filterDefs = OBJECT_TYPES[this.state.objectType].filters

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
					<option key={filterKey} value={filterKey}>{utils.sentenceCase(filterKey)}</option>
				)}
			</select>

			children = React.cloneElement(filterDefs[filter.key], {value: filter.value || "", onChange: this.onChange})
		}

		onRemove = onRemove || this.removeSearchFilter

		return <FormGroup>
			<Col xs={3}><ControlLabel>{label}</ControlLabel></Col>
			<Col xs={8}>{children}</Col>
			<Col xs={1}>
				<Button bsStyle="link" onClick={onRemove}>
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
		if (event.target) {
			filter.value = event.target.value
		} else {
			filter.value = event
		}
	}

	@autobind
	removeSearchFilter() {
		let filters = this.props.query.filters
		filters.splice(filters.indexOf(this.props.filter), 1)

		// FIXME: this is awful, we should not pass parent in
		this.props.parent.forceUpdate()
	}
}
