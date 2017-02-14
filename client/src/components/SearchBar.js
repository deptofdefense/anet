import React, {Component} from 'react'
import {Form, Button, InputGroup, FormControl} from 'react-bootstrap'
import History from 'components/History'

import SEARCH_ICON from 'resources/search-alt.png'

export default class SearchBar extends Component {
	constructor(props) {
		super(props)
		this.state = {query: History.getCurrentLocation().query.text || ''}

		this.onChange = this.onChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
	}

	render() {
		return (
			<Form onSubmit={this.onSubmit}>
				<InputGroup>
					<FormControl value={this.state.query} placeholder="Search for people, reports, positions, or locations" onChange={this.onChange}/>
					<InputGroup.Button>
						<Button onClick={this.onSubmit} ><img src={SEARCH_ICON} height={16} alt="Search" /></Button>
					</InputGroup.Button>
				</InputGroup>
			</Form>
		)
	}

	onChange(event) {
		this.setState({query: event.target.value})
	}

	onSubmit(event) {
		History.push({pathname: 'search', query: {text: this.state.query}})
		event.preventDefault()
		event.stopPropagation()
	}
}
