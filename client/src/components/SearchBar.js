import React, {Component} from 'react'
import {Form, Button, InputGroup, FormControl} from 'react-bootstrap'

export default class SearchBar extends Component {
	static contextTypes = {
		router: React.PropTypes.object.isRequired
	}

	constructor(props, context) {
		super(props, context)
		this.state = {query: context.router.location.query.q || ""}

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
		this.context.router.push('/search?q=' + this.state.query)
		event.preventDefault()
		event.stopPropagation()
	}
}
