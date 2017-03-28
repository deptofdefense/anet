import React, {Component, PropTypes} from 'react'
import autobind from 'autobind-decorator'
import utils from 'utils'

export default class SelectSearchFilter extends Component {
	static propTypes = {
		queryKey: PropTypes.string.isRequired,
		values: PropTypes.array.isRequired,
		labels: PropTypes.array

		//From SearchFilter row
		//value
		//onChange
	}


	componentWillMount() {
		this.value = this.props.values && this.props.values[0]
		this.updateQuery()
	}

	render() {
		let values = this.props.values
		let labels = this.props.labels || values.map(v => utils.sentenceCase(v))

		return <select value={this.value} onChange={this.onChange} >
			{values.map((v,idx) =>
				<option key={idx} value={v}>{labels[idx]}</option>
			)}
		</select>

	}

	@autobind
	onChange(event) {
		this.value = event.target.value
		this.updateQuery()
	}

	@autobind
	updateQuery() {
		let query = {}
		query[this.props.queryKey] = this.value
		this.props.onChange(query)
	}

}
