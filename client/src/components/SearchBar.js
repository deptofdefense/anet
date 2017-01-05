import React, {Component} from 'react'
import {Form, Button, InputGroup, FormControl} from 'react-bootstrap'
import History from 'components/History'

export default class SearchBar extends Component {
	constructor(props) {
		super(props)
		this.state = {query: History.getCurrentLocation().query.q || ""}

		this.onChange = this.onChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
	}

	render() {
		return (
			<Form onSubmit={this.onSubmit}>
				<InputGroup>
					<FormControl value={this.state.query} placeholder="Search for people, reports, positions, or locations" onChange={this.onChange}/>
					<InputGroup.Button>
						<Button>🔍</Button>
					</InputGroup.Button>
				</InputGroup>
			</Form>
		)
	}

	onChange(event) {
		this.setState({query: event.target.value})
	}

	onSubmit(event) {
		History.push('/search?q=' + this.state.query)
		event.preventDefault()
		event.stopPropagation()
	}
}
