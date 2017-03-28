import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import 'utils'
import Autocomplete from 'components/Autocomplete'

export default class TextFilter extends Component {

	constructor(props) {
		super(props)

		this.setState({
			value: null,
		})
	}

	render() {
		<FormControl value={this.state.value} onChange={this.onChange} />
	}

	getQueryParams() {
		let query = {text: this.state.value}
		return query
	}

	getFilterName() {
		return "Text"
	}

	@autobind
	onChange(event) {
		this.setState({value: event.target.value})
	}
}

